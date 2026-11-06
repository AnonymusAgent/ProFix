import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAuth, signToken, type AuthUser } from '../middleware/auth.js';
import { ApiError, ok } from '../utils/http.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().trim().email('Enter a valid email address').max(254).transform((v) => v.toLowerCase()),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email().transform((v) => v.toLowerCase()),
  password: z.string().min(1, 'Password is required'),
});

interface UserRow {
  id: string; name: string; email: string; phone: string | null;
  role: AuthUser['role']; password_hash: string; created_at: string;
}

function publicUser(u: UserRow) {
  return { id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, createdAt: u.created_at };
}

router.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await query('SELECT id FROM users WHERE lower(email) = $1', [body.email]);
    if (existing.rowCount) throw new ApiError(409, 'EMAIL_TAKEN', 'An account with this email already exists.');
    const hash = await bcrypt.hash(body.password, 12);
    const { rows } = await query<UserRow>(
      `INSERT INTO users (name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [body.name, body.email, body.phone || null, hash],
    );
    const user = rows[0];
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return ok(res, { token, user: publicUser(user) }, 201);
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const { rows } = await query<UserRow>('SELECT * FROM users WHERE lower(email) = $1', [body.email]);
    const user = rows[0];
    if (!user) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    const valid = await bcrypt.compare(body.password, user.password_hash);
    if (!valid) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return ok(res, { token, user: publicUser(user) });
  } catch (e) { next(e); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query<UserRow>('SELECT * FROM users WHERE id = $1', [req.user!.id]);
    if (!rows[0]) throw new ApiError(404, 'NOT_FOUND', 'User not found');
    return ok(res, { user: publicUser(rows[0]) });
  } catch (e) { next(e); }
});

const updateMeSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
});

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const body = updateMeSchema.parse(req.body);
    const sets: string[] = [];
    const params: unknown[] = [];
    if (body.name !== undefined) { params.push(body.name); sets.push(`name = $${params.length}`); }
    if (body.phone !== undefined) { params.push(body.phone || null); sets.push(`phone = $${params.length}`); }
    if (!sets.length) throw new ApiError(422, 'VALIDATION_ERROR', 'Nothing to update.');
    params.push(req.user!.id);
    const { rows } = await query<UserRow>(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params,
    );
    if (!rows[0]) throw new ApiError(404, 'NOT_FOUND', 'User not found');
    return ok(res, { user: publicUser(rows[0]) });
  } catch (e) { next(e); }
});

export default router;
