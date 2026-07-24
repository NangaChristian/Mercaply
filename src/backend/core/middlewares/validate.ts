import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../exceptions/AppError.js';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        next(new ValidationError('Erreur de validation des données', (error as any).errors || (error as any).issues));
      } else {
        next(error);
      }
    }
  };
};
