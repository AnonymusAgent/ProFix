import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError, fail } from '../utils/http.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (err.code === 'DB_NOT_CONFIGURED') {
      return res.status(503).json({
        error: {
          code: err.code,
          message: 'Database is not configured yet. Set DATABASE_URL (Neon) — see README.md.',
        },
      });
    }
    return fail(res, err);
  }
  if (err instanceof ZodError) {
    return fail(
      res,
      new ApiError(422, 'VALIDATION_ERROR', 'Invalid request data.', err.flatten()),
    );
  }
  if (err && typeof err === 'object' && (err as { code?: string }).code === 'DB_NOT_CONFIGURED') {
    return res.status(503).json({
      error: {
        code: 'DB_NOT_CONFIGURED',
        message: 'Database is not configured yet. Set DATABASE_URL (Neon) — see README.md.',
      },
    });
  }
  // PostgreSQL unique violation
  if (err && typeof err === 'object' && (err as { code?: string }).code === '23505') {
    return fail(res, new ApiError(409, 'CONFLICT', 'A record with the same unique value already exists.'));
  }
  console.error('[api] unhandled error:', err);
  return fail(res, new ApiError(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.'));
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, 'NOT_FOUND', 'API route not found'));
}
