import { GoogleGenAI } from '@google/genai';
import { logger } from '../../../core/logger/Logger.js';

export class AIService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
      logger.info('AIService initialized with Gemini API');
    } else {
      logger.warn('GEMINI_API_KEY is not set. AIService will run in mock/disabled mode.');
    }
  }

  /**
   * Enterprise Use Case: Analyze a product listing for fraud/counterfeit or restricted items.
   */
  async moderateProductListing(title: string, description: string): Promise<{ isApproved: boolean; reason: string; confidence: number }> {
    if (!this.ai) {
      return { isApproved: true, reason: 'AI disabled, auto-approved', confidence: 1 };
    }

    try {
      const prompt = `
      You are a Trust & Safety AI for a B2B/B2C marketplace in Africa.
      Review the following product listing and determine if it violates our policies (counterfeit, illegal, weapons, drugs).
      
      Title: ${title}
      Description: ${description}
      
      Respond strictly in JSON format:
      {"isApproved": boolean, "reason": "string", "confidence": number (0 to 1)}
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });

      if (!response.text) throw new Error("Empty response from AI");
      const result = JSON.parse(response.text);
      
      logger.info(`Product moderation completed`, { title, isApproved: result.isApproved });
      return result;
    } catch (error) {
      logger.error('Failed to moderate product listing', error);
      // Fallback: pending human review
      return { isApproved: false, reason: 'AI Moderation failed - requires manual review', confidence: 0 };
    }
  }

  /**
   * Enterprise Use Case: Generate highly optimized SEO descriptions for products/services.
   */
  async generateSEODescription(keywords: string[], category: string): Promise<string> {
    if (!this.ai) return `Optimized description for ${keywords.join(', ')}`;
    
    try {
      const prompt = `Generate a highly optimized, conversion-focused SEO meta description (max 155 characters) for a product in the '${category}' category, using the following keywords: ${keywords.join(', ')}. Language: French.`;
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text?.trim() || '';
    } catch (error) {
      logger.error('Failed to generate SEO description', error);
      return '';
    }
  }
}

export const aiService = new AIService();
