import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { query } from '../db/pool.js';
import { requireAdmin } from '../middleware/auth.js';
import { ApiError, notFound, ok } from '../utils/http.js';

const router = Router();
router.use(requireAdmin);

function accountsSchemaMissing(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  return code === '42P01' || code === '42703';
}

const ACCOUNTS_NOT_INSTALLED = () =>
  new ApiError(503, 'ACCOUNTS_TABLE_MISSING', 'Account tools are not installed yet. Run server/db/accounts-schema.sql in the Neon SQL Editor.');

interface UserRowFull {
  id: string; name: string; email: string; phone: string | null; role: string;
  created_at: string; status?: string; suspend_reason?: string | null;
}

function mapAdminUser(r: UserRowFull, reportCount: number, isWorker: boolean) {
  return {
    id: r.id, name: r.name, email: r.email, phone: r.phone, role: r.role,
    status: r.status === 'suspended' ? 'suspended' : 'active',
    suspendReason: r.suspend_reason ?? null,
    reportCount,
    isWorker,
    createdAt: r.created_at,
  };
}

/** Shared loader for the users list (tolerates pre-migration schemas). */
async function loadAdminUsers() {
  let rows: UserRowFull[];
  try {
    ({ rows } = await query<UserRowFull>(
      'SELECT id, name, email, phone, role, created_at, status, suspend_reason FROM users ORDER BY created_at DESC LIMIT 200',
    ));
  } catch (err) {
    if (!accountsSchemaMissing(err)) throw err;
    ({ rows } = await query<UserRowFull>(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC LIMIT 200',
    ));
  }
  let counts = new Map<string, number>();
  try {
    const { rows: reportRows } = await query<{ reported_email: string; n: string }>(
      'SELECT reported_email, COUNT(*)::text AS n FROM fraud_reports GROUP BY reported_email',
    );
    counts = new Map(reportRows.map((r) => [r.reported_email, Number(r.n)]));
  } catch { /* reports table not installed yet */ }
  let workerEmails = new Set<string>();
  try {
    const { rows: workerRows } = await query<{ email: string }>('SELECT email FROM worker_profiles');
    workerEmails = new Set(workerRows.map((r) => r.email));
  } catch { /* worker table optional */ }
  return rows.map((r) => mapAdminUser(r, counts.get(r.email) ?? 0, workerEmails.has(r.email)));
}

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

/** GET /api/admin/analytics — web/business analytics for the Overview tab */
router.get('/analytics', async (_req, res, next) => {
  try {
    const { rows: bookings } = await query<{
      status: string; created_at: string; price_cents: number | null; service_title: string | null;
    }>(
      `SELECT b.status, b.created_at, s.price_cents, s.title AS service_title
         FROM bookings b LEFT JOIN services s ON s.id = b.service_id
        ORDER BY b.created_at DESC LIMIT 2000`,
    );
    const { rows: userRows } = await query<{ role: string; created_at: string; status?: string }>(
      'SELECT role, created_at, status FROM users',
    ).catch(() => query<{ role: string; created_at: string; status?: string }>('SELECT role, created_at FROM users'));
    let workerCount = 0;
    try {
      const { rows } = await query<{ n: string }>('SELECT COUNT(*)::text AS n FROM worker_profiles');
      workerCount = Number(rows[0]?.n || 0);
    } catch { /* optional */ }
    let totalReports = 0;
    try {
      const { rows } = await query<{ n: string }>('SELECT COUNT(*)::text AS n FROM fraud_reports');
      totalReports = Number(rows[0]?.n || 0);
    } catch { /* optional */ }

    const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const now = new Date();
    const monthly: { month: string; bookings: number; revenueCents: number; signups: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthly.push({ month: monthKey(d), bookings: 0, revenueCents: 0, signups: 0 });
    }
    const byKey = new Map(monthly.map((m) => [m.month, m]));
    const serviceCounts = new Map<string, number>();
    let revenueCents = 0;
    let completedCount = 0;
    for (const b of bookings) {
      const slot = byKey.get(monthKey(new Date(b.created_at)));
      if (slot) slot.bookings += 1;
      if (b.status === 'completed') {
        completedCount += 1;
        revenueCents += b.price_cents ?? 0;
        if (slot) slot.revenueCents += b.price_cents ?? 0;
      }
      const title = b.service_title || 'Other service';
      serviceCounts.set(title, (serviceCounts.get(title) ?? 0) + 1);
    }
    for (const u of userRows) {
      const slot = byKey.get(monthKey(new Date(u.created_at)));
      if (slot) slot.signups += 1;
    }
    const activeBookings = bookings.filter((b) => b.status !== 'cancelled').length;

    return ok(res, {
      analytics: {
        revenueCents,
        completedJobs: completedCount,
        completionRate: activeBookings ? Math.round((completedCount / activeBookings) * 100) : 0,
        totalCustomers: userRows.filter((u) => u.role === 'customer').length,
        totalWorkers: workerCount,
        suspendedAccounts: userRows.filter((u) => u.status === 'suspended').length,
        fraudReports: totalReports,
        monthly,
        topServices: [...serviceCounts.entries()]
          .map(([title, count]) => ({ title, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
      },
    });
  } catch (e) { next(e); }
});

/** GET /api/admin/users */
router.get('/users', async (_req, res, next) => {
  try {
    return ok(res, { users: await loadAdminUsers() });
  } catch (e) { next(e); }
});

/** PATCH /api/admin/users/:id/role */
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = z.object({ role: z.enum(['customer', 'admin', 'technician']) }).parse(req.body);
    if (req.params.id === req.user!.id && role !== 'admin') {
      throw new ApiError(422, 'INVALID_STATE', 'You cannot remove your own admin role.');
    }
    const { rows } = await query<UserRowFull>(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, phone, role, created_at, status, suspend_reason',
      [role, req.params.id],
    ).catch((err) => {
      if (accountsSchemaMissing(err)) {
        return query<UserRowFull>(
          'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, phone, role, created_at',
          [role, req.params.id],
        );
      }
      throw err;
    });
    if (!rows[0]) throw notFound('User');
    const users = await loadAdminUsers();
    return ok(res, { user: users.find((u) => u.id === rows[0].id) ?? mapAdminUser(rows[0], 0, false) });
  } catch (e) { next(e); }
});

const statusSchema = z.object({
  status: z.enum(['active', 'suspended']),
  reason: z.string().trim().max(300).optional().or(z.literal('')),
});

/**
 * PATCH /api/admin/users/:id/status — suspend or reinstate an account.
 * Suspension blocks API tokens (Neon bridge + DB login) and flags the
 * profile as fraud-suspended everywhere it appears. Admins cannot
 * suspend themselves or other admin accounts.
 */
router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const body = statusSchema.parse(req.body);
    if (req.params.id === req.user!.id) {
      throw new ApiError(422, 'INVALID_STATE', 'You cannot suspend your own account.');
    }
    const { rows: targets } = await query<{ email: string; role: string }>(
      'SELECT email, role FROM users WHERE id = $1', [req.params.id],
    );
    if (!targets[0]) throw notFound('User');
    if (targets[0].role === 'admin') {
      throw new ApiError(422, 'INVALID_STATE', 'Admin accounts cannot be suspended here.');
    }
    try {
      await query(
        `UPDATE users SET status = $1, suspend_reason = $2,
           suspended_at = CASE WHEN $1 = 'suspended' THEN now() ELSE NULL END
         WHERE id = $3`,
        [body.status, body.status === 'suspended' ? (body.reason || 'Suspended by admin') : null, req.params.id],
      );
    } catch (err) {
      if (accountsSchemaMissing(err)) throw ACCOUNTS_NOT_INSTALLED();
      throw err;
    }
    const users = await loadAdminUsers();
    return ok(res, { user: users.find((u) => u.id === req.params.id) });
  } catch (e) { next(e); }
});

/**
 * DELETE /api/admin/users/:id — permanently remove an account (and its
 * worker profile, if any). Used e.g. to remove the legacy seeded admin.
 * The owner admin account and the caller's own account are protected.
 */
router.delete('/users/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user!.id) {
      throw new ApiError(422, 'INVALID_STATE', 'You cannot delete your own account.');
    }
    const { rows: targets } = await query<{ email: string }>(
      'SELECT email FROM users WHERE id = $1', [req.params.id],
    );
    if (!targets[0]) throw notFound('User');
    if (targets[0].email.toLowerCase() === config.admin.email) {
      throw new ApiError(422, 'INVALID_STATE', 'The owner admin account cannot be deleted.');
    }
    try {
      await query('DELETE FROM worker_profiles WHERE email = $1', [targets[0].email]);
    } catch { /* worker table optional */ }
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    return ok(res, { deleted: true });
  } catch (e) { next(e); }
});

export default router;
