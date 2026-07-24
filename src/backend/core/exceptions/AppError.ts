export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;

  constructor(message: string, statusCode: number = 500, errorCode?: string, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Ressource non trouvée') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  public readonly details: any;
  constructor(message: string = 'Erreur de validation', details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Non autorisé') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Accès refusé') {
    super(message, 403, 'FORBIDDEN');
  }
}
