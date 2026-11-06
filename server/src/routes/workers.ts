import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { ApiError, ok } from '../utils/http.js';

/**
 * Worker (plumber / electrician) profiles + activity.
 *
 * Workers authenticate with Neon Auth in the browser; the ProFix API never
 * sees their password. The profile is keyed by the Neon account email, so
 * the frontend must only call these endpoints for the signed-in Neon user.
 * Earnings: workers keep 70% of the completed job value; the payout is
 * snapshotted onto the booking when it is assigned/completed, falling back
 * to 70% of the service price for display.
 */

export const WORKER_PAYOUT_RATE = 0.7;

const router = Router();

const profileSchema = z.object({
  email: z.string().trim().email().max(254),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  trade: z.enum(['plumber', 'electrician']),
  neonUserId: z.string().trim().max(120).optional().or(z.literal('')),
});

interface WorkerRow {
  id: string; neon_user_id: string | null; email: string; name: string;
  phone: string | null; trade: string; created_at: string; updated_at: string;
}

function mapWorker(r: WorkerRow) {
  return {
    id: r.id, neonUserId: r.neon_user_id, email: r.email, name: r.name,
    phone: r.phone, trade: r.trade, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

/** POST /api/workers/profile — create/update the signed-in worker's profile */
router.post('/profile', async (req, res, next) => {
  try {
    const body = profileSchema.parse(req.body);
    const { rows } = await query<WorkerRow>(
      `INSERT INTO worker_profiles (neon_user_id, email, name, phone, trade)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET
         neon_user_id = EXCLUDED.neon_user_id,
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         trade = EXCLUDED.trade,
         updated_at = now()
       RETURNING *`,
      [body.neonUserId || null, body.email.toLowerCase(), body.name, body.phone || null, body.trade],
    );
    return ok(res, { worker: mapWorker(rows[0]) });
  } catch (err) {
    return next(err);
  }
});

/** GET /api/workers/me?email= — profile, earnings and monthly activity */
router.get('/me', async (req, res, next) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) throw new ApiError(422, 'VALIDATION_ERROR', 'email query parameter is required.');
    const { rows: workers } = await query<WorkerRow>(
      'SELECT * FROM worker_profiles WHERE email = $1',
      [email],
    );
    if (!workers.length) throw new ApiError(404, 'WORKER_NOT_FOUND', 'No worker profile for this account yet.');
    const worker = workers[0];
    const tradeCategory = worker.trade === 'plumber' ? 'plumbing' : 'electrical';

    // Assigned jobs for this worker
    const { rows: assigned } = await query<{
      id: string; status: string; payout_cents: number | null; price_cents: number | null;
      created_at: string; preferred_date: string | null; service_title: string | null;
    }>(
      `SELECT b.id, b.status, b.payout_cents, s.price_cents, b.created_at, b.preferred_date,
              s.title AS service_title
         FROM bookings b
         LEFT JOIN services s ON s.id = b.service_id
        WHERE b.worker_email = $1
        ORDER BY b.created_at DESC`,
      [email],
    );

    const now = new Date();
    const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const earningsOf = (r: { payout_cents: number | null; price_cents: number | null }) =>
      r.payout_cents ?? Math.round((r.price_cents ?? 0) * WORKER_PAYOUT_RATE);

    const completed = assigned.filter((r) => r.status === 'completed');
    const earnedThisMonth = completed
      .filter((r) => monthKey(new Date(r.created_at)) === monthKey(now))
      .reduce((sum, r) => sum + earningsOf(r), 0);
    const earnedThisYear = completed
      .filter((r) => new Date(r.created_at).getFullYear() === now.getFullYear())
      .reduce((sum, r) => sum + earningsOf(r), 0);

    // Last 6 months of earnings (oldest -> newest) for the activity chart
    const monthly: { month: string; earnedCents: number; jobs: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      const rowsInMonth = completed.filter((r) => monthKey(new Date(r.created_at)) === key);
      monthly.push({
        month: key,
        earnedCents: rowsInMonth.reduce((sum, r) => sum + earningsOf(r), 0),
        jobs: rowsInMonth.length,
      });
    }

    // Trade-wide demand (context): jobs in this worker's trade
    const { rows: tradeRows } = await query<{ status: string; created_at: string }>(
      `SELECT b.status, b.created_at
         FROM bookings b
         LEFT JOIN services s ON s.id = b.service_id
        WHERE COALESCE(s.category, b.service_type) = $1`,
      [tradeCategory],
    );
    const tradeCompletedMonth = tradeRows.filter(
      (r) => r.status === 'completed' && monthKey(new Date(r.created_at)) === monthKey(now),
    ).length;

    return ok(res, {
      worker: mapWorker(worker),
      stats: {
        payoutRate: WORKER_PAYOUT_RATE,
        earnedThisMonthCents: earnedThisMonth,
        earnedThisYearCents: earnedThisYear,
        completedJobs: completed.length,
        upcomingJobs: assigned.filter((r) => ['pending', 'confirmed', 'in_progress'].includes(r.status)).length,
        tradeCompletedThisMonth: tradeCompletedMonth,
        monthly,
        recentJobs: assigned.slice(0, 8).map((r) => ({
          id: r.id,
          service: r.service_title || 'Service visit',
          status: r.status,
          date: r.preferred_date || r.created_at,
          earnedCents: r.status === 'completed' ? earningsOf(r) : null,
        })),
      },
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
