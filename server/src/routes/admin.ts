import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAdmin } from '../middleware/auth.js';
import { ApiError, notFound, ok } from '../utils/http.js';

const router = Router();
router.use(requireAdmin);

/** GET /api/admin/stats — dashboard counters */
router.get('/stats', async (_req, res, next) => {
  try {
    const [bookings, byStatus, users, messages, services] = await Promise.all([
      query<{ n: string }>('SELECT COUNT(*)::text AS n FROM bookings'),
      query<{ status: string; n: string }>('SELECT status, COUNT(*)::text AS n FROM bookings GROUP BY status'),
      query<{ n: string }>('SELECT COUNT(*)::text AS n FROM users'),
      query<{ n: string }>('SELECT COUNT(*)::text AS n FROM contact_messages WHERE is_read = FALSE'),
      query<{ n: string }>('SELECT COUNT(*)::text AS n FROM services WHERE is_active = TRUE'),
    ]);
    return ok(res, {
      stats: {
        totalBookings: Number(bookings.rows[0]?.n || 0),
        bookingsByStatus: Object.fromEntries(byStatus.rows.map((r) => [r.status, Number(r.n)])),
        totalUsers: Number(users.rows[0]?.n || 0),
        unreadMessages: Number(messages.rows[0]?.n || 0),
        activeServices: Number(services.rows[0]?.n || 0),
      },
    });
  } catch (e) { next(e); }
});

/** GET /api/admin/users */
router.get('/users', async (_req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC LIMIT 200',
    );
    return ok(res, {
      users: rows.map((r) => ({
        id: r.id, name: r.name, email: r.email, phone: r.phone, role: r.role, createdAt: r.created_at,
      })),
    });
  } catch (e) { next(e); }
});

/** PATCH /api/admin/users/:id/role */
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = z.object({ role: z.enum(['customer', 'admin', 'technician']) }).parse(req.body);
    if (req.params.id === req.user!.id && role !== 'admin') {
      throw new ApiError(422, 'INVALID_STATE', 'You cannot remove your own admin role.');
    }
    const { rows } = await query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, phone, role, created_at',
      [role, req.params.id],
    );
    if (!rows[0]) throw notFound('User');
    const r = rows[0];
    return ok(res, { user: { id: r.id, name: r.name, email: r.email, phone: r.phone, role: r.role, createdAt: r.created_at } });
  } catch (e) { next(e); }
});

export default router;
