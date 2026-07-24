import { Router } from 'express';
import { PaymentController } from './controllers/PaymentController.js';

const router = Router();
const paymentController = new PaymentController();

// Checkout Session
router.post('/checkout', paymentController.checkout);

// Webhook endpoint (dynamic by provider)
router.post('/webhook/:providerId', paymentController.webhook);
// Legacy route support for Fapshi (no provider param)
router.post('/webhook', paymentController.webhook);

export { router as paymentsRouter };
