import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError, ok } from '../utils/http.js';

/**
 * Fraud reports: signed-in customers/workers can report another account
 * (usually the worker on their booking, or a customer). One report per
 * reporter per account. Admins see the counts in the Users tab; accounts
 * with more than 3 reports are flagged for suspension review.
 */
const router = Router();

const reportSchema = z.object({
  reportedEmail: z.string().trim().email().max(254).transform((v) => v.toLowerCase()),
  reason: z.string().trim().max(500).optional().or(z.literal('')),
});

function reportsTableMissing(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  return code === '42P01' || code === '42703';
}

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const body = reportSchema.parse(req.body);
    const reporter = req.user!.email.toLowerCase();
    if (reporter === body.reportedEmail) {
      throw new ApiError(422, 'INVALID_STATE', 'You cannot report your own account.');
    }
    await query(
      `INSERT INTO fraud_reports (reporter_email, reported_email, reason)
       VALUES ($1, $2, $3)
       ON CONFLICT (reporter_email, reported_email) DO NOTHING`,
      [reporter, body.reportedEmail, body.reason || null],
    );
    const { rows } = await query<{ n: string }>(
      'SELECT COUNT(*)::text AS n FROM fraud_reports WHERE reported_email = $1',
      [body.reportedEmail],
    );
    return ok(res, { reported: true, reportCount: Number(rows[0]?.n || 0) }, 201);
  } catch (err) {
    if (reportsTableMissing(err)) {
      return next(new ApiError(503, 'ACCOUNTS_TABLE_MISSING', 'Fraud reporting is not installed yet. Run server/db/accounts-schema.sql in the Neon SQL Editor.'));
    }
    return next(err);
  }
});

export default router;
