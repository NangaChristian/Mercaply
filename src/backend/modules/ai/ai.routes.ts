import { Router, Request, Response, NextFunction } from 'express';
import { aiService } from './services/AIService.js';
import { rateLimiter } from '../../core/security/RateLimiter.js';

const router = Router();

// Strict rate limiting for AI endpoints (Expensive operations)
const aiRateLimit = rateLimiter({ windowMs: 60000, maxRequests: 5 });

router.post('/moderate', aiRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      res.status(400).json({ success: false, error: "Title and description are required" });
      return;
    }
    
    const result = await aiService.moderateProductListing(title, description);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/generate-seo', aiRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keywords, category } = req.body;
    if (!keywords || !Array.isArray(keywords) || !category) {
      res.status(400).json({ success: false, error: "Valid keywords array and category are required" });
      return;
    }
    
    const result = await aiService.generateSEODescription(keywords, category);
    res.status(200).json({ success: true, data: { description: result } });
  } catch (error) {
    next(error);
  }
});

export { router as aiRouter };
