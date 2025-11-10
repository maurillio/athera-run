/**
 * LLM Client - Centralized API for calling LLM providers
 * Supports: OpenRouter, Abacus AI, OpenAI
 */

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMRequest {
  model?: string;
  messages: LLMMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: string };
}

interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Call LLM API with current configured provider
 */
export async function callLLM(request: LLMRequest): Promise<string> {
  const provider = process.env.LLM_PROVIDER || 'openai';

  let url: string;
  let headers: Record<string, string>;
  let body: any;

  switch (provider) {
    case 'openrouter':
      url = 'https://openrouter.ai/api/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://atherarun.com',
        'X-Title': 'Athera Run',
      };
      body = {
        model: request.model || process.env.LLM_MODEL || 'openai/gpt-4o',
        messages: request.messages,
        temperature: request.temperature ?? 0.5,
        max_tokens: request.max_tokens ?? 8000,
        ...(request.response_format && { response_format: request.response_format }),
      };
      break;

    case 'openai':
    default:
      url = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      };
      body = {
        model: request.model || process.env.LLM_MODEL || 'gpt-4o',
        messages: request.messages,
        temperature: request.temperature ?? 0.5,
        max_tokens: request.max_tokens ?? 8000,
        ...(request.response_format && { response_format: request.response_format }),
      };
      break;
  }

  console.log(`[LLM] 🔄 Chamando ${provider} API...`);
  
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch (fetchError) {
    console.error('[LLM] ❌ Erro ao fazer fetch:', fetchError);
    throw new Error(`Falha na conexão com ${provider}: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[LLM] ❌ API retornou erro ${response.status}:`, errorText);
    
    // Mensagens mais específicas por tipo de erro
    if (response.status === 401) {
      throw new Error(`Autenticação falhou com ${provider}: API Key inválida ou expirada. Verifique OPENAI_API_KEY no Vercel.`);
    } else if (response.status === 429) {
      throw new Error(`Limite de requisições excedido no ${provider}: Quota atingida ou rate limit. Verifique seu plano em platform.openai.com/usage`);
    } else if (response.status === 500 || response.status === 502 || response.status === 503) {
      throw new Error(`${provider} está temporariamente indisponível: ${response.status} ${response.statusText}`);
    }
    
    throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
  }

  let data: LLMResponse;
  try {
    data = await response.json();
  } catch (jsonError) {
    console.error('[LLM] ❌ Erro ao fazer parse do JSON:', jsonError);
    throw new Error(`Resposta da API em formato inválido: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
  }
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
    console.error('[LLM] ❌ Estrutura de resposta inválida:', JSON.stringify(data).substring(0, 200));
    throw new Error('Resposta da API não contém o campo esperado "choices[0].message.content"');
  }
  
  console.log(`[LLM] ✅ Resposta recebida com sucesso (${data.choices[0].message.content.length} caracteres)`);
  return data.choices[0].message.content;
}

/**
 * Test LLM connection
 */
export async function testLLMConnection(): Promise<{ success: boolean; message: string; provider: string }> {
  try {
    const provider = process.env.LLM_PROVIDER || 'openai';

    const response = await callLLM({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Respond with just the word "OK" if you can read this message.' }
      ],
      temperature: 0,
      max_tokens: 10,
    });

    return {
      success: true,
      message: `LLM connection successful! Response: ${response.trim()}`,
      provider,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Unknown error',
      provider: process.env.LLM_PROVIDER || 'openai',
    };
  }
}
