export class CacheManager {
  private static readonly CACHE_PREFIX = 'athera-pwa-';
  private static readonly MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 dias

  static async addToCache(cacheName: string, key: string, data: any): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open(this.CACHE_PREFIX + cacheName);
      const response = new Response(JSON.stringify({
        data,
        timestamp: Date.now(),
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
      await cache.put(key, response);
      console.log('[CacheManager] Cached:', key);
    } catch (error) {
      console.error('[CacheManager] Failed to cache:', key, error);
    }
  }

  static async getFromCache(cacheName: string, key: string): Promise<any | null> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return null;
    }

    try {
      const cache = await caches.open(this.CACHE_PREFIX + cacheName);
      const response = await cache.match(key);
      
      if (!response) {
        return null;
      }

      const { data, timestamp } = await response.json();
      
      if (Date.now() - timestamp > this.MAX_AGE) {
        console.log('[CacheManager] Cache expired:', key);
        await this.removeFromCache(cacheName, key);
        return null;
      }

      console.log('[CacheManager] Cache hit:', key);
      return data;
    } catch (error) {
      console.error('[CacheManager] Failed to get from cache:', key, error);
      return null;
    }
  }

  static async removeFromCache(cacheName: string, key: string): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open(this.CACHE_PREFIX + cacheName);
      await cache.delete(key);
      console.log('[CacheManager] Removed from cache:', key);
    } catch (error) {
      console.error('[CacheManager] Failed to remove from cache:', key, error);
    }
  }

  static async clearExpiredCache(): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      const atheraoCaches = cacheNames.filter(name => name.startsWith(this.CACHE_PREFIX));

      for (const cacheName of atheraoCaches) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();

        for (const request of requests) {
          const response = await cache.match(request);
          if (!response) continue;

          try {
            const { timestamp } = await response.json();
            if (Date.now() - timestamp > this.MAX_AGE) {
              await cache.delete(request);
              console.log('[CacheManager] Removed expired:', request.url);
            }
          } catch {
            // Skip if not JSON or no timestamp
          }
        }
      }

      console.log('[CacheManager] Expired cache cleanup complete');
    } catch (error) {
      console.error('[CacheManager] Failed to clear expired cache:', error);
    }
  }

  static async getCacheSize(): Promise<number> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return 0;
    }

    try {
      const cacheNames = await caches.keys();
      const atheraoCaches = cacheNames.filter(name => name.startsWith(this.CACHE_PREFIX));
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error('[CacheManager] Failed to get cache size:', error);
      return 0;
    }
  }

  static async clearAllCache(): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      const atheraoCaches = cacheNames.filter(name => name.startsWith(this.CACHE_PREFIX));

      await Promise.all(
        atheraoCaches.map(cacheName => caches.delete(cacheName))
      );

      console.log('[CacheManager] All cache cleared');
    } catch (error) {
      console.error('[CacheManager] Failed to clear all cache:', error);
    }
  }
}
