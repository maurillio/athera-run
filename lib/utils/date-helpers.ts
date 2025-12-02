/**
 * Date helpers para evitar hidratação SSR
 * Garante consistência entre servidor e cliente
 */

/**
 * Retorna data atual no formato ISO (YYYY-MM-DD)
 * Para uso em valores iniciais de formulários
 */
export function getTodayISO(): string {
  if (typeof window === 'undefined') {
    // No servidor, retorna string vazia para evitar hidratação
    return '';
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * Retorna data formatada de forma segura
 * @param date - Date object ou string
 * @returns Data no formato ISO (YYYY-MM-DD)
 */
export function toISODate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Hook para usar data atual apenas no cliente
 * Evita problemas de hidratação SSR
 */
export function useClientDate() {
  if (typeof window === 'undefined') {
    return '';
  }
  return new Date().toISOString().split('T')[0];
}
