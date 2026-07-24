import { Router, Request, Response, NextFunction } from 'express';
import { seoService } from './services/SEOService.js';

const router = Router();

router.get('/robots.txt', (req: Request, res: Response) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers.host || 'mercaply.com';
  const baseUrl = `${protocol}://${host}`;
  
  res.type('text/plain');
  res.send(seoService.generateRobotsTxt(baseUrl));
});

router.get('/sitemap.xml', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host || 'mercaply.com';
    const baseUrl = `${protocol}://${host}`;
    
    const sitemap = await seoService.generateSitemap(baseUrl);
    
    res.type('application/xml');
    res.send(sitemap);
  } catch (error) {
    next(error);
  }
});

export { router as seoRouter };
