import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { env } from '../config/env';

/**
 * Centralized error handling middleware.
 *
 * Principles:
 * - Operational errors (AppError) return structured JSON with statusCode
 * - Programming errors (unexpected) return 500; details hidden in production
 * - Validation errors (express-validator) transformed to 400 with field details
 *
 * Placed last in middleware chain so any unhandled error bubbles here.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // express-validator validation errors
  if (err && typeof err === 'object' && 'array' in err && typeof (err as { array: unknown }).array === 'function') {
    const validationErr = err as { array: () => { msg: string; path: string }[] };
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: validationErr.array(),
    });
    return;
  }

  // Unknown errors - do not leak internals in production
  const isProd = env.NODE_ENV === 'production';
  const statusCode = 500;
  const message = isProd ? 'Internal server error' : err instanceof Error ? err.message : 'Unknown error';

  if (!isProd && err instanceof Error) {
    console.error('[ErrorHandler]', err);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
  });
};
