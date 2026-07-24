import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/PaymentService.js';
import { HttpResponse } from '../../../core/interfaces/HttpResponse.js';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  public checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId, providerId = 'fapshi', userId, userEmail, amount, redirectUrl } = req.body;

      const result = await this.paymentService.createCheckoutSession(
        orderId,
        providerId,
        userId,
        userEmail,
        amount,
        redirectUrl
      );

      const response: HttpResponse = {
        success: true,
        data: result
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public webhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const providerId = req.params.providerId || 'fapshi';
      const signature = req.headers['x-provider-signature'] as string || '';
      
      await this.paymentService.processWebhook(providerId, req.body, signature);

      res.status(200).json({ received: true });
    } catch (error) {
      // In webhook, we often return 200 or 400, not 500 so providers don't retry forever on code errors
      // But for critical errors it's okay.
      console.error(`[Webhook Error] Provider: ${req.params.providerId}`, error);
      res.status(400).json({ error: "Webhook processing failed" });
    }
  };
}
