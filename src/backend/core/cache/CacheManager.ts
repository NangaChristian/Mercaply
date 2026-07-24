import { logger } from '../logger/Logger.js';

export interface ICacheManager {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * In-memory fallback. 
 * In Enterprise Production, this implements a Redis client (e.g. ioredis).
 */
export class InMemoryCacheManager implements ICacheManager {
  private cache: Map<string, { value: any; expiresAt: number | null }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    logger.debug(`Cache HIT: ${key}`);
    return item.value as T;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { value, expiresAt });
    logger.debug(`Cache SET: ${key} (TTL: ${ttlSeconds || 'infinite'})`);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
    logger.debug(`Cache DEL: ${key}`);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    logger.debug(`Cache CLEARED`);
  }
}

export const cacheManager = new InMemoryCacheManager();
