import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../exceptions/AppError.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${req.method} ${req.path}`, err);

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details,
      },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
      },
    });
  }

  // Internal Server Error
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Une erreur interne est survenue.' : err.message,
    },
  });
};
