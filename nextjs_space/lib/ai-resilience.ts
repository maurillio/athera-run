/**
 * Sistema de Resiliência e Auto-Recuperação da IA
 *
 * Este módulo garante que a IA nunca falhe completamente e sempre
 * tente se recuperar de erros, proporcionando uma experiência contínua
 * ao usuário mesmo em situações adversas.
 */

import { callLLM } from './llm-client';

// Tipos de erros que podemos encontrar
enum ErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  INVALID_RESPONSE = 'invalid_response',
  PARSE_ERROR = 'parse_error',
  API_ERROR = 'api_error',
  UNKNOWN = 'unknown'
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // em ms
  maxDelay: number; // em ms
  backoffMultiplier: number;
}

interface AICallOptions {
  retryConfig?: Partial<RetryConfig>;
  fallbackResponse?: any;
  validateResponse?: (response: any) => boolean;
  cacheKey?: string;
  cacheTTL?: number; // em ms
  timeout?: number; // em ms
  onRetry?: (attempt: number, error: Error) => void;
  onFallback?: (error: Error) => void;
}

// Cache simples em memória
const responseCache = new Map<string, { data: any; timestamp: number }>();

// Configuração padrão
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  baseDelay: 1000, // 1 segundo
  maxDelay: 30000, // 30 segundos
  backoffMultiplier: 2
};

// Estatísticas de saúde do sistema
const healthStats = {
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  retriedCalls: 0,
  fallbacksUsed: 0,
  cacheHits: 0,
  averageResponseTime: 0,
  lastError: null as Error | null,
  lastSuccessTime: Date.now()
};

/**
 * Identifica o tipo de erro para melhor tratamento
 */
function identifyErrorType(error: any): ErrorType {
  const message = error.message?.toLowerCase() || '';

  if (message.includes('network') || message.includes('fetch failed')) {
    return ErrorType.NETWORK;
  }
  if (message.includes('timeout') || message.includes('timed out')) {
    return ErrorType.TIMEOUT;
  }
  if (message.includes('rate limit') || message.includes('429')) {
    return ErrorType.RATE_LIMIT;
  }
  if (message.includes('parse') || message.includes('json')) {
    return ErrorType.PARSE_ERROR;
  }
  if (message.includes('invalid') || message.includes('validation')) {
    return ErrorType.INVALID_RESPONSE;
  }
  if (message.includes('api') || error.status) {
    return ErrorType.API_ERROR;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Calcula o delay para retry com exponential backoff
 */
function calculateRetryDelay(attempt: number, config: RetryConfig): number {
  const delay = Math.min(
    config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelay
  );

  // Adicionar jitter para evitar thundering herd
  const jitter = Math.random() * 0.3 * delay;
  return Math.floor(delay + jitter);
}

/**
 * Aguarda um período de tempo
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifica se deve fazer retry baseado no tipo de erro e tentativa
 */
function shouldRetry(error: any, attempt: number, maxRetries: number): boolean {
  if (attempt >= maxRetries) {
    return false;
  }

  const errorType = identifyErrorType(error);

  // Não retry em erros de validação (problema no código, não temporário)
  if (errorType === ErrorType.INVALID_RESPONSE || errorType === ErrorType.PARSE_ERROR) {
    return false;
  }

  return true;
}

/**
 * Obtém resposta do cache se disponível e válida
 */
function getCachedResponse(cacheKey: string, cacheTTL: number): any | null {
  if (!cacheKey) return null;

  const cached = responseCache.get(cacheKey);
  if (!cached) return null;

  const age = Date.now() - cached.timestamp;
  if (age > cacheTTL) {
    responseCache.delete(cacheKey);
    return null;
  }

  console.log(`[AI RESILIENCE] Cache HIT para ${cacheKey} (idade: ${Math.floor(age / 1000)}s)`);
  healthStats.cacheHits++;
  return cached.data;
}

/**
 * Salva resposta no cache
 */
function cacheResponse(cacheKey: string, data: any): void {
  if (!cacheKey) return;

  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });

  console.log(`[AI RESILIENCE] Resposta cacheada: ${cacheKey}`);

  // Limpar cache antigo (manter apenas últimos 100 itens)
  if (responseCache.size > 100) {
    const oldestKey = responseCache.keys().next().value;
    responseCache.delete(oldestKey);
  }
}

/**
 * Função principal: Chamada resiliente à IA com retry, fallback e cache
 */
export async function resilientAICall<T = any>(
  callFunction: () => Promise<T>,
  options: AICallOptions = {}
): Promise<T> {
  const startTime = Date.now();
  healthStats.totalCalls++;

  const config: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...options.retryConfig
  };

  // Tentar cache primeiro
  if (options.cacheKey && options.cacheTTL) {
    const cached = getCachedResponse(options.cacheKey, options.cacheTTL);
    if (cached !== null) {
      return cached;
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      console.log(`[AI RESILIENCE] Tentativa ${attempt + 1}/${config.maxRetries}`);

      // Executar a chamada com timeout
      const result = await Promise.race([
        callFunction(),
        options.timeout
          ? new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), options.timeout)
            )
          : Promise.resolve(null as never)
      ].filter(p => p !== null));

      // Validar resposta se validador fornecido
      if (options.validateResponse && !options.validateResponse(result)) {
        throw new Error('Resposta da IA não passou na validação');
      }

      // Sucesso!
      healthStats.successfulCalls++;
      healthStats.lastSuccessTime = Date.now();

      const responseTime = Date.now() - startTime;
      healthStats.averageResponseTime =
        (healthStats.averageResponseTime * (healthStats.successfulCalls - 1) + responseTime) /
        healthStats.successfulCalls;

      console.log(`[AI RESILIENCE] ✅ Sucesso na tentativa ${attempt + 1} (${responseTime}ms)`);

      // Cachear resultado se configurado
      if (options.cacheKey && options.cacheTTL) {
        cacheResponse(options.cacheKey, result);
      }

      return result;

    } catch (error) {
      lastError = error as Error;
      const errorType = identifyErrorType(error);

      console.error(`[AI RESILIENCE] ❌ Erro na tentativa ${attempt + 1}:`, {
        type: errorType,
        message: lastError.message
      });

      healthStats.lastError = lastError;

      // Chamar callback de retry se fornecido
      if (options.onRetry) {
        options.onRetry(attempt + 1, lastError);
      }

      // Verificar se deve fazer retry
      if (!shouldRetry(error, attempt, config.maxRetries)) {
        console.log(`[AI RESILIENCE] 🛑 Não faremos retry (erro: ${errorType})`);
        break;
      }

      // Última tentativa? Não esperar
      if (attempt === config.maxRetries - 1) {
        break;
      }

      // Calcular delay e aguardar
      const delay = calculateRetryDelay(attempt, config);
      console.log(`[AI RESILIENCE] ⏳ Aguardando ${delay}ms antes do retry...`);
      healthStats.retriedCalls++;

      await sleep(delay);
    }
  }

  // Se chegou aqui, todas as tentativas falharam
  healthStats.failedCalls++;

  // Usar fallback se disponível
  if (options.fallbackResponse !== undefined) {
    console.log('[AI RESILIENCE] 🔄 Usando resposta fallback');
    healthStats.fallbacksUsed++;

    if (options.onFallback) {
      options.onFallback(lastError!);
    }

    return options.fallbackResponse;
  }

  // Sem fallback, propagar erro
  console.error('[AI RESILIENCE] 💀 Todas as tentativas falharam e não há fallback');
  throw lastError || new Error('Falha desconhecida na chamada à IA');
}

/**
 * Wrapper específico para chamadas LLM com configurações otimizadas
 */
export async function resilientLLMCall(
  messages: Array<{ role: string; content: string }>,
  options: {
    maxTokens?: number;
    temperature?: number;
    responseFormat?: { type: string };
    fallbackResponse?: string;
    cacheKey?: string;
    validateJSON?: boolean;
  } = {}
): Promise<string> {
  return resilientAICall(
    async () => {
      const response = await callLLM({
        messages: messages as any,
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature ?? 0.5,
        response_format: options.responseFormat
      });

      return response;
    },
    {
      retryConfig: {
        maxRetries: 5,
        baseDelay: 2000, // LLM pode demorar, aguardar 2s
        maxDelay: 60000, // até 1 minuto
        backoffMultiplier: 2
      },
      fallbackResponse: options.fallbackResponse,
      validateResponse: options.validateJSON
        ? (response: string) => {
            try {
              JSON.parse(response);
              return true;
            } catch {
              return false;
            }
          }
        : undefined,
      cacheKey: options.cacheKey,
      cacheTTL: options.cacheKey ? 5 * 60 * 1000 : undefined, // 5 minutos
      timeout: 120000, // 2 minutos timeout
      onRetry: (attempt, error) => {
        console.log(`[LLM RETRY] Tentativa ${attempt} falhou: ${error.message}`);
      },
      onFallback: (error) => {
        console.warn('[LLM FALLBACK] Usando resposta fallback após erro:', error.message);
      }
    }
  );
}

/**
 * Obtém estatísticas de saúde do sistema
 */
export function getHealthStats() {
  const successRate = healthStats.totalCalls > 0
    ? (healthStats.successfulCalls / healthStats.totalCalls) * 100
    : 0;

  const timeSinceLastSuccess = Date.now() - healthStats.lastSuccessTime;

  return {
    ...healthStats,
    successRate: Math.round(successRate * 100) / 100,
    timeSinceLastSuccess: Math.round(timeSinceLastSuccess / 1000), // em segundos
    cacheSize: responseCache.size,
    status: successRate > 90 ? 'healthy' : successRate > 70 ? 'degraded' : 'unhealthy'
  };
}

/**
 * Limpa o cache (útil para testes ou reset)
 */
export function clearCache() {
  responseCache.clear();
  console.log('[AI RESILIENCE] Cache limpo');
}

/**
 * Reseta estatísticas
 */
export function resetStats() {
  healthStats.totalCalls = 0;
  healthStats.successfulCalls = 0;
  healthStats.failedCalls = 0;
  healthStats.retriedCalls = 0;
  healthStats.fallbacksUsed = 0;
  healthStats.cacheHits = 0;
  healthStats.averageResponseTime = 0;
  healthStats.lastError = null;
  healthStats.lastSuccessTime = Date.now();
  console.log('[AI RESILIENCE] Estatísticas resetadas');
}
