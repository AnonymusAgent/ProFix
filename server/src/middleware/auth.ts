import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { ApiError } from '../utils/http.js';

export interface AuthUser {
  id: string;
  email: string;
  role: 'customer' | 'admin' | 'technician';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

function parseToken(req: Request): AuthUser | null {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  try {
    const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
    if (!payload.sub) return null;
    return {
      id: String(payload.sub),
      email: String(payload.email || ''),
      role: (payload.role as AuthUser['role']) || 'customer',
    };
  } catch {
    return null;
  }
}

/** Attach req.user when a valid token is present; never rejects. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  req.user = parseToken(req) ?? undefined;
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const user = parseToken(req);
  if (!user) return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required. Please log in.'));
  req.user = user;
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const user = parseToken(req);
  if (!user) return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required. Please log in.'));
  if (user.role !== 'admin') return next(new ApiError(403, 'FORBIDDEN', 'Admin access required.'));
  req.user = user;
  next();
}
