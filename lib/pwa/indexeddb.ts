import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'athera-pwa';
const DB_VERSION = 1;

export interface PlanData {
  id: string;
  userId: string;
  data: any;
  lastSync: number;
}

export interface WorkoutData {
  id: string;
  userId: string;
  weekId: string;
  data: any;
  lastSync: number;
}

export interface ProfileData {
  userId: string;
  data: any;
  lastSync: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'workout-complete' | 'workout-log' | 'profile-update';
  data: any;
  timestamp: number;
  retries: number;
}

let dbInstance: IDBPDatabase | null = null;

export async function openDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('plans')) {
        const planStore = db.createObjectStore('plans', { keyPath: 'id' });
        planStore.createIndex('userId', 'userId', { unique: false });
        planStore.createIndex('lastSync', 'lastSync', { unique: false });
      }

      if (!db.objectStoreNames.contains('workouts')) {
        const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' });
        workoutStore.createIndex('userId', 'userId', { unique: false });
        workoutStore.createIndex('weekId', 'weekId', { unique: false });
        workoutStore.createIndex('lastSync', 'lastSync', { unique: false });
      }

      if (!db.objectStoreNames.contains('profile')) {
        const profileStore = db.createObjectStore('profile', { keyPath: 'userId' });
        profileStore.createIndex('lastSync', 'lastSync', { unique: false });
      }

      if (!db.objectStoreNames.contains('sync-queue')) {
        const syncStore = db.createObjectStore('sync-queue', { 
          keyPath: 'id',
          autoIncrement: true 
        });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        syncStore.createIndex('type', 'type', { unique: false });
      }
    },
  });

  console.log('[IndexedDB] Database opened:', DB_NAME, 'version', DB_VERSION);
  return dbInstance;
}

export async function savePlan(plan: PlanData): Promise<void> {
  const db = await openDatabase();
  await db.put('plans', {
    ...plan,
    lastSync: Date.now(),
  });
  console.log('[IndexedDB] Plan saved:', plan.id);
}

export async function getPlan(userId: string): Promise<PlanData | null> {
  const db = await openDatabase();
  const plans = await db.getAllFromIndex('plans', 'userId', userId);
  
  if (plans.length === 0) {
    return null;
  }

  const latestPlan = plans.sort((a, b) => b.lastSync - a.lastSync)[0];
  console.log('[IndexedDB] Plan retrieved:', latestPlan.id);
  return latestPlan;
}

export async function saveWorkout(workout: WorkoutData): Promise<void> {
  const db = await openDatabase();
  await db.put('workouts', {
    ...workout,
    lastSync: Date.now(),
  });
  console.log('[IndexedDB] Workout saved:', workout.id);
}

export async function getWorkouts(userId: string, weekId?: string): Promise<WorkoutData[]> {
  const db = await openDatabase();
  
  if (weekId) {
    const workouts = await db.getAllFromIndex('workouts', 'weekId', weekId);
    console.log('[IndexedDB] Workouts retrieved for week:', weekId, workouts.length);
    return workouts;
  }

  const workouts = await db.getAllFromIndex('workouts', 'userId', userId);
  console.log('[IndexedDB] All workouts retrieved:', workouts.length);
  return workouts;
}

export async function saveProfile(profile: ProfileData): Promise<void> {
  const db = await openDatabase();
  await db.put('profile', {
    ...profile,
    lastSync: Date.now(),
  });
  console.log('[IndexedDB] Profile saved:', profile.userId);
}

export async function getProfile(userId: string): Promise<ProfileData | null> {
  const db = await openDatabase();
  const profile = await db.get('profile', userId);
  
  if (profile) {
    console.log('[IndexedDB] Profile retrieved:', userId);
  }
  
  return profile || null;
}

export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<void> {
  const db = await openDatabase();
  const id = await db.add('sync-queue', {
    ...item,
    timestamp: Date.now(),
    retries: 0,
  });
  console.log('[IndexedDB] Added to sync queue:', id, item.type);
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await openDatabase();
  const items = await db.getAll('sync-queue');
  console.log('[IndexedDB] Sync queue retrieved:', items.length, 'items');
  return items;
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await openDatabase();
  await db.delete('sync-queue', id);
  console.log('[IndexedDB] Removed from sync queue:', id);
}

export async function incrementSyncRetries(id: string): Promise<void> {
  const db = await openDatabase();
  const item = await db.get('sync-queue', id);
  
  if (item) {
    await db.put('sync-queue', {
      ...item,
      retries: item.retries + 1,
    });
    console.log('[IndexedDB] Sync retries incremented:', id, item.retries + 1);
  }
}

export async function clearOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
  const db = await openDatabase();
  const now = Date.now();
  const cutoff = now - maxAge;

  const stores = ['plans', 'workouts', 'profile'];
  
  for (const storeName of stores) {
    const tx = db.transaction(storeName, 'readwrite');
    const index = tx.store.index('lastSync');
    
    let cursor = await index.openCursor();
    
    while (cursor) {
      if (cursor.value.lastSync < cutoff) {
        await cursor.delete();
        console.log('[IndexedDB] Deleted old data from', storeName, cursor.value.id);
      }
      cursor = await cursor.continue();
    }
    
    await tx.done;
  }

  console.log('[IndexedDB] Old data cleanup complete');
}

export async function clearAllData(): Promise<void> {
  const db = await openDatabase();
  const stores = ['plans', 'workouts', 'profile', 'sync-queue'];
  
  for (const storeName of stores) {
    await db.clear(storeName);
    console.log('[IndexedDB] Cleared store:', storeName);
  }

  console.log('[IndexedDB] All data cleared');
}

export async function getDatabaseSize(): Promise<number> {
  const db = await openDatabase();
  const stores = ['plans', 'workouts', 'profile', 'sync-queue'];
  let totalSize = 0;

  for (const storeName of stores) {
    const count = await db.count(storeName);
    totalSize += count;
  }

  return totalSize;
}
