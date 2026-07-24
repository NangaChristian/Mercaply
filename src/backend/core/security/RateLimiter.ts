import { Request, Response, NextFunction } from 'express';
import { cacheManager } from '../cache/CacheManager.js';
import { logger } from '../logger/Logger.js';
import { AppError } from '../exceptions/AppError.js';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

/**
 * Enterprise Rate Limiter utilizing the global CacheManager (Redis in prod).
 * Supports IP-based and User-based limiting.
 */
export const rateLimiter = (config: RateLimitConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use User ID if authenticated, else IP
      const identifier = (req as any).user?.id || req.ip || 'unknown';
      const key = `ratelimit:${req.route?.path || req.path}:${identifier}`;

      let currentCount = await cacheManager.get<number>(key) || 0;

      if (currentCount >= config.maxRequests) {
        logger.warn(`Rate limit exceeded for ${identifier} on ${req.path}`);
        return next(new AppError('Trop de requêtes, veuillez réessayer plus tard.', 429, 'TOO_MANY_REQUESTS'));
      }

      await cacheManager.set(key, currentCount + 1, config.windowMs / 1000);
      
      // Headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - (currentCount + 1)));
      
      next();
    } catch (error) {
      // Fail open in case of cache failure to not block traffic, but log it
      logger.error('RateLimiter error', error);
      next();
    }
  };
};
