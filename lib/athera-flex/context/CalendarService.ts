// lib/athera-flex/context/CalendarService.ts
import { CalendarContext } from './ContextAwarenessEngine';
import { prisma } from '@/lib/prisma';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isImportant: boolean;
  type: 'work' | 'personal' | 'travel' | 'other';
}

export class CalendarService {
  private static instance: CalendarService;

  private constructor() {}

  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  /**
   * Analisa calendário do usuário para detectar conflitos
   */
  async getCalendarContext(
    userId: number,
    workoutDate: Date,
    workoutDuration: number = 60 // minutos
  ): Promise<CalendarContext> {
    try {
      // Buscar eventos do banco (armazenados via Google Calendar sync)
      const events = await this.fetchUserEvents(userId, workoutDate);

      // Calcular janela do treino (4h antes/depois)
      const workoutStart = workoutDate;
      const workoutEnd = new Date(workoutDate.getTime() + workoutDuration * 60 * 1000);
      const windowStart = new Date(workoutDate.getTime() - 4 * 60 * 60 * 1000);
      const windowEnd = new Date(workoutDate.getTime() + 4 * 60 * 60 * 1000);

      // Detectar conflitos
      const conflicts = events.filter(event => 
        this.hasConflict(
          { start: workoutStart, end: workoutEnd },
          { start: event.start, end: event.end }
        )
      );

      // Detectar eventos importantes próximos
      const nearbyImportantEvents = events.filter(event => 
        event.isImportant &&
        event.start >= windowStart &&
        event.start <= windowEnd &&
        !conflicts.includes(event)
      );

      // Calcular slots disponíveis
      const availableSlots = this.calculateAvailableSlots(events, workoutDate, workoutDuration);

      return {
        hasConflicts: conflicts.length > 0 || nearbyImportantEvents.length > 0,
        conflicts: [...conflicts, ...nearbyImportantEvents].map(e => ({
          title: e.title,
          start: e.start,
          end: e.end,
          isImportant: e.isImportant,
        })),
        availableSlots,
      };
    } catch (error) {
      console.error('[CalendarService] Error analyzing calendar:', error);
      return {
        hasConflicts: false,
        conflicts: [],
        availableSlots: [],
      };
    }
  }

  /**
   * Busca eventos do usuário no banco
   */
  private async fetchUserEvents(
    userId: number,
    targetDate: Date
  ): Promise<CalendarEvent[]> {
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const events = await prisma.calendar_events.findMany({
      where: {
        user_id: userId,
        start: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        start: 'asc',
      },
    });

    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      isImportant: event.is_important,
      type: event.event_type as 'work' | 'personal' | 'travel' | 'other',
    }));
  }

  /**
   * Verifica se há conflito entre dois períodos
   */
  private hasConflict(
    period1: { start: Date; end: Date },
    period2: { start: Date; end: Date }
  ): boolean {
    return (
      (period1.start >= period2.start && period1.start < period2.end) ||
      (period1.end > period2.start && period1.end <= period2.end) ||
      (period1.start <= period2.start && period1.end >= period2.end)
    );
  }

  /**
   * Calcula slots disponíveis no dia
   */
  private calculateAvailableSlots(
    events: CalendarEvent[],
    targetDate: Date,
    workoutDuration: number
  ): Array<{ start: string; end: string }> {
    const slots: Array<{ start: string; end: string }> = [];

    // Definir janela de análise (6h às 22h)
    const dayStart = new Date(targetDate);
    dayStart.setHours(6, 0, 0, 0);

    const dayEnd = new Date(targetDate);
    dayEnd.setHours(22, 0, 0, 0);

    // Se não tem eventos, dia inteiro disponível
    if (events.length === 0) {
      slots.push({
        start: this.formatTime(dayStart),
        end: this.formatTime(dayEnd),
      });
      return slots;
    }

    // Ordenar eventos por início
    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

    // Verificar slot antes do primeiro evento
    const firstEvent = sortedEvents[0];
    if (firstEvent.start.getTime() - dayStart.getTime() >= workoutDuration * 60 * 1000) {
      slots.push({
        start: this.formatTime(dayStart),
        end: this.formatTime(firstEvent.start),
      });
    }

    // Verificar slots entre eventos
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEnd = sortedEvents[i].end;
      const nextStart = sortedEvents[i + 1].start;

      if (nextStart.getTime() - currentEnd.getTime() >= workoutDuration * 60 * 1000) {
        slots.push({
          start: this.formatTime(currentEnd),
          end: this.formatTime(nextStart),
        });
      }
    }

    // Verificar slot após último evento
    const lastEvent = sortedEvents[sortedEvents.length - 1];
    if (dayEnd.getTime() - lastEvent.end.getTime() >= workoutDuration * 60 * 1000) {
      slots.push({
        start: this.formatTime(lastEvent.end),
        end: this.formatTime(dayEnd),
      });
    }

    return slots;
  }

  /**
   * Formata horário (HH:MM)
   */
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Sync de eventos do Google Calendar (chamado manualmente ou por webhook)
   */
  async syncGoogleCalendarEvents(
    userId: number,
    accessToken: string,
    days: number = 7
  ): Promise<void> {
    // TODO: Implementar integração com Google Calendar API
    // Por enquanto, apenas mock para estrutura do banco estar pronta
    console.log(`[CalendarService] Google Calendar sync requested for user ${userId}`);
    
    // Exemplo de como seria:
    // 1. Chamar Google Calendar API com accessToken
    // 2. Buscar eventos dos próximos {days} dias
    // 3. Filtrar eventos importantes (palavras-chave: reunião, viagem, etc)
    // 4. Inserir/atualizar no banco (calendar_events)
    // 5. Retornar sucesso
  }
}

export const calendarService = CalendarService.getInstance();
