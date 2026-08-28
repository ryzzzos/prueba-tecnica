import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    res.status(422).json({
      error: 'Validation Error',
      message: 'Los datos enviados no cumplen con los requisitos de validacion.',
      issues: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  // Handle Domain/Application Errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      details: err.details,
    });
    return;
  }

  // Handle Prisma Known Errors (like unique constraint or foreign key constraint)
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(409).json({
      error: 'Database Conflict Error',
      message: err.message,
    });
    return;
  }

  // Handle Generic Internal Server Errors
  console.error('[ERROR] Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Ha ocurrido un error inesperado en el servidor.',
  });
};
