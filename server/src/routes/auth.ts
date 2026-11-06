import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { config } from '../config.js';
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
  const r = u as UserRow & { status?: string };
  return {
    id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role,
    status: r.status === 'suspended' ? 'suspended' : 'active',
    createdAt: u.created_at,
  };
}

const SUSPENDED_ERROR = () =>
  new ApiError(403, 'ACCOUNT_SUSPENDED', 'This account has been suspended. Please contact ProFix support.');

/**
 * GET /api/auth/email-status?email= — public pre-registration check.
 * Customer and worker accounts are kept separate: the sign-up pages use
 * this to stop duplicate registrations ("already a customer", "already
 * a worker") before Neon Auth is even called. Returns no account data
 * beyond existence/kind/status.
 */
router.get('/email-status', async (req, res, next) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) throw new ApiError(422, 'VALIDATION_ERROR', 'A valid email query parameter is required.');
    const { rows: users } = await query<{ role: string; status?: string }>(
      'SELECT role FROM users WHERE lower(email) = $1', [email],
    ).catch(() => ({ rows: [] as { role: string; status?: string }[] }));
    if (users[0]) {
      // status column arrives with accounts-schema.sql; tolerate its absence
      const { rows: st } = await query<{ status?: string }>(
        'SELECT status FROM users WHERE lower(email) = $1', [email],
      ).catch(() => ({ rows: [] as { status?: string }[] }));
      users[0].status = st[0]?.status;
    }
    let isWorker = false;
    try {
      const { rows } = await query('SELECT id FROM worker_profiles WHERE email = $1', [email]);
      isWorker = rows.length > 0;
    } catch { /* worker table optional */ }
    const user = users[0];
    return ok(res, {
      email,
      exists: Boolean(user) || isWorker,
      asCustomer: Boolean(user) && user?.role !== 'admin',
      asWorker: isWorker,
      role: user?.role ?? null,
      suspended: user?.status === 'suspended',
    });
  } catch (e) { next(e); }
});

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

/** Constant-time password comparison (digests first, so lengths never leak). */
function passwordMatches(candidate: string, expected: string): boolean {
  const a = createHash('sha256').update(candidate).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);

    // Owner admin: fixed email (config.admin.email, default
    // alimukhtar@profix.com) + password from the ADMIN_PASSWORD env var
    // (Vercel -> profix-backend). No DB seed and no repo-stored password
    // involved. On success we upsert the admin row so /auth/me and the
    // admin endpoints have a real user id to work with. JWT_SECRET still
    // signs the resulting session token — it is a signing key, not a
    // password, and stays required.
    if (body.email === config.admin.email) {
      if (!config.admin.password || !passwordMatches(body.password, config.admin.password)) {
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
      }
      const existing = await query<UserRow>('SELECT * FROM users WHERE lower(email) = $1', [body.email]);
      let user = existing.rows[0];
      if (!user) {
        const hash = await bcrypt.hash(randomUUID(), 12);
        const { rows } = await query<UserRow>(
          `INSERT INTO users (name, email, phone, password_hash, role)
           VALUES ($1, $2, NULL, $3, 'admin') RETURNING *`,
          [config.admin.name, body.email, hash],
        );
        user = rows[0];
      } else if (user.role !== 'admin') {
        const { rows } = await query<UserRow>(
          `UPDATE users SET role = 'admin' WHERE id = $1 RETURNING *`,
          [user.id],
        );
        user = rows[0];
      }
      const token = signToken({ id: user.id, email: user.email, role: user.role });
      return ok(res, { token, user: publicUser(user) });
    }

    // Everyone else: DB bcrypt login — but never for admin-role rows.
    // The owner env login above is now the ONLY way to obtain an admin
    // token, so old seeded admin passwords (e.g. admin-user.sql) stop
    // working here instead of lingering as a second admin door.
    const { rows } = await query<UserRow>('SELECT * FROM users WHERE lower(email) = $1', [body.email]);
    const user = rows[0];
    if (!user || user.role === 'admin') throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    if ((user as UserRow & { status?: string }).status === 'suspended') throw SUSPENDED_ERROR();
    const valid = await bcrypt.compare(body.password, user.password_hash);
    if (!valid) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return ok(res, { token, user: publicUser(user) });
  } catch (e) { next(e); }
});

const neonBridgeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Enter a valid email address').max(254).transform((v) => v.toLowerCase()),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
});

/**
 * Neon Auth -> ProFix API bridge.
 *
 * Customers/workers sign in with Neon Auth (cookies on Neon's domain), but
 * the ProFix API protects /bookings/me, cancellations and reviews with its
 * own JWT. Without this exchange a Neon-signed-in customer got
 * "401 Authentication required" everywhere. The browser calls this right
 * after a Neon session is established (login, register, session restore);
 * we upsert the customer row and mint the API token.
 *
 * Trust model: the API password stays owned by Neon — bridged accounts get
 * an unusable random password_hash, so /auth/login can never sign them in.
 * This endpoint NEVER issues a token for an admin-role account, so the
 * hidden /loginadmin JWT flow remains the only way to get admin rights.
 */
router.post('/neon', async (req, res, next) => {
  try {
    const body = neonBridgeSchema.parse(req.body);
    const existing = await query<UserRow>('SELECT * FROM users WHERE lower(email) = $1', [body.email]);
    let user = existing.rows[0];
    if (user && user.role === 'admin') {
      throw new ApiError(403, 'STAFF_ACCOUNT', 'This email belongs to a staff account. Please use the admin sign-in.');
    }
    let created = false;
    if (!user) {
      const hash = await bcrypt.hash(randomUUID(), 12);
      const { rows } = await query<UserRow>(
        `INSERT INTO users (name, email, phone, password_hash)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [body.name, body.email, body.phone || null, hash],
      );
      user = rows[0];
      created = true;
    } else if (body.phone && !user.phone) {
      const { rows } = await query<UserRow>(
        'UPDATE users SET phone = $1 WHERE id = $2 RETURNING *',
        [body.phone, user.id],
      );
      user = rows[0];
    }
    // Suspended accounts (admin action, usually after fraud reports) get
    // no API token — the web app turns this into a sign-out + notice.
    if ((user as UserRow & { status?: string }).status === 'suspended') throw SUSPENDED_ERROR();
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return ok(res, { token, user: publicUser(user) }, created ? 201 : 200);
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
