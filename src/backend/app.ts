import { Router } from 'express';
import { errorHandler } from './core/middlewares/errorHandler.js';
import { paymentsRouter } from './modules/payments/payments.routes.js';
import { aiRouter } from './modules/ai/ai.routes.js';
import { seoRouter } from './modules/seo/seo.routes.js';

const apiV1Router = Router();

apiV1Router.use('/payments', paymentsRouter);
apiV1Router.use('/ai', aiRouter);
apiV1Router.use('/seo', seoRouter);

apiV1Router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API v1 (Enterprise) is healthy' });
});

// Middleware global de gestion des erreurs pour l'API v1
apiV1Router.use(errorHandler);

export { apiV1Router };
