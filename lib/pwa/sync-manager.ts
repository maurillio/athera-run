import { addToSyncQueue, getSyncQueue, removeFromSyncQueue, incrementSyncRetries } from './indexeddb';

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 segundos

export class SyncManager {
  private static instance: SyncManager;
  private isSyncing = false;
  private syncCallbacks: Array<(progress: SyncProgress) => void> = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[SyncManager] Back online, processing sync queue');
        this.processSyncQueue();
      });
    }
  }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  async addToQueue(type: 'workout-complete' | 'workout-log' | 'profile-update', data: any): Promise<void> {
    await addToSyncQueue({
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    });

    console.log('[SyncManager] Added to queue:', type);

    if (navigator.onLine) {
      this.processSyncQueue();
    }
  }

  async processSyncQueue(): Promise<void> {
    if (this.isSyncing) {
      console.log('[SyncManager] Sync already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('[SyncManager] Offline, skipping sync');
      return;
    }

    this.isSyncing = true;
    const queue = await getSyncQueue();

    if (queue.length === 0) {
      console.log('[SyncManager] Sync queue is empty');
      this.isSyncing = false;
      return;
    }

    console.log('[SyncManager] Processing', queue.length, 'items');
    this.notifyProgress({ total: queue.length, completed: 0, failed: 0 });

    let completed = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        await this.syncItem(item);
        await removeFromSyncQueue(item.id);
        completed++;
        console.log('[SyncManager] Synced:', item.type, item.id);
      } catch (error) {
        console.error('[SyncManager] Failed to sync:', item.type, item.id, error);
        
        if (item.retries < MAX_RETRIES) {
          await incrementSyncRetries(item.id);
        } else {
          await removeFromSyncQueue(item.id);
          failed++;
          console.error('[SyncManager] Max retries reached, removing from queue:', item.id);
        }
      }

      this.notifyProgress({ total: queue.length, completed, failed });
    }

    this.isSyncing = false;
    console.log('[SyncManager] Sync complete:', completed, 'completed,', failed, 'failed');
  }

  private async syncItem(item: any): Promise<void> {
    const { type, data } = item;

    switch (type) {
      case 'workout-complete':
        await this.syncWorkoutComplete(data);
        break;
      case 'workout-log':
        await this.syncWorkoutLog(data);
        break;
      case 'profile-update':
        await this.syncProfileUpdate(data);
        break;
      default:
        throw new Error(`Unknown sync type: ${type}`);
    }
  }

  private async syncWorkoutComplete(data: any): Promise<void> {
    const response = await fetch('/api/workouts/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync workout complete: ${response.status}`);
    }
  }

  private async syncWorkoutLog(data: any): Promise<void> {
    const response = await fetch('/api/workouts/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync workout log: ${response.status}`);
    }
  }

  private async syncProfileUpdate(data: any): Promise<void> {
    const response = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync profile update: ${response.status}`);
    }
  }

  onProgress(callback: (progress: SyncProgress) => void): () => void {
    this.syncCallbacks.push(callback);
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyProgress(progress: SyncProgress): void {
    this.syncCallbacks.forEach(callback => callback(progress));
  }

  async markWorkoutComplete(workoutId: string, data: any): Promise<void> {
    if (navigator.onLine) {
      try {
        await this.syncWorkoutComplete({ workoutId, ...data });
        console.log('[SyncManager] Workout completed online:', workoutId);
      } catch (error) {
        console.error('[SyncManager] Failed to complete workout online, queueing:', error);
        await this.addToQueue('workout-complete', { workoutId, ...data });
      }
    } else {
      console.log('[SyncManager] Offline, queueing workout completion:', workoutId);
      await this.addToQueue('workout-complete', { workoutId, ...data });
    }
  }
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
}

export const syncManager = SyncManager.getInstance();
