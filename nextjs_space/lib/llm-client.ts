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
  const provider = process.env.LLM_PROVIDER || 'abacusai';

  let url: string;
  let headers: Record<string, string>;
  let body: any;

  switch (provider) {
    case 'openai':
      url = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      };
      body = {
        model: request.model || process.env.LLM_MODEL || 'gpt-4o-mini',
        messages: request.messages,
        temperature: request.temperature ?? 0.5,
        max_tokens: request.max_tokens ?? 8000,
        ...(request.response_format && { response_format: request.response_format }),
      };
      break;

    case 'openrouter':
      url = 'https://openrouter.ai/api/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://athera-run.com', // OpenRouter requires this
        'X-Title': 'Athera Run', // OpenRouter requires this
      };
      body = {
        model: request.model || process.env.LLM_MODEL || 'openai/gpt-4o',
        messages: request.messages,
        temperature: request.temperature ?? 0.5,
        max_tokens: request.max_tokens ?? 8000,
        ...(request.response_format && { response_format: request.response_format }),
      };
      break;

    case 'abacusai':
    default:
      url = 'https://apps.abacus.ai/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      };
      body = {
        model: request.model || 'gpt-4o',
        messages: request.messages,
        temperature: request.temperature ?? 0.5,
        max_tokens: request.max_tokens ?? 8000,
        ...(request.response_format && { response_format: request.response_format }),
      };
      break;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
  }

  const data: LLMResponse = await response.json();
  return data.choices[0].message.content;
}

/**
 * Test LLM connection
 */
export async function testLLMConnection(): Promise<{ success: boolean; message: string; provider: string }> {
  try {
    const provider = process.env.LLM_PROVIDER || 'abacusai';

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
      provider: process.env.LLM_PROVIDER || 'abacusai',
    };
  }
}
