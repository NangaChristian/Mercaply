import { supabaseAdmin } from '../../../core/db/supabase.js';
import { logger } from '../../../core/logger/Logger.js';

export class SEOService {
  
  /**
   * Generates a dynamic robots.txt for production.
   */
  generateRobotsTxt(baseUrl: string): string {
    return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /checkout/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  }

  /**
   * Example: Enterprise Sitemap Generator using Streams (simulated here)
   * Fetches all products and categories to generate a massive XML sitemap.
   */
  async generateSitemap(baseUrl: string): Promise<string> {
    if (!supabaseAdmin) {
      logger.warn("Supabase not configured, returning empty sitemap.");
      return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    }

    try {
      // In a real enterprise system, we would stream this or use a background worker
      // to upload multiple chunks (sitemap-1.xml, sitemap-2.xml, sitemap-index.xml) to Cloud Storage
      
      const { data: products } = await supabaseAdmin.from('products').select('id, updated_at').limit(1000);
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      
      // Static routes
      xml += this.buildSitemapNode(`${baseUrl}`, new Date().toISOString(), 'daily', 1.0);
      xml += this.buildSitemapNode(`${baseUrl}/products`, new Date().toISOString(), 'hourly', 0.9);
      xml += this.buildSitemapNode(`${baseUrl}/services`, new Date().toISOString(), 'hourly', 0.9);

      // Dynamic routes (Products)
      if (products) {
        for (const p of products) {
           xml += this.buildSitemapNode(`${baseUrl}/product/${p.id}`, p.updated_at, 'weekly', 0.8);
        }
      }

      xml += `</urlset>`;
      return xml;
    } catch (error) {
      logger.error('Failed to generate sitemap', error);
      throw error;
    }
  }

  private buildSitemapNode(url: string, lastmod: string, changefreq: string, priority: number): string {
    return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>\n`;
  }
}

export const seoService = new SEOService();
