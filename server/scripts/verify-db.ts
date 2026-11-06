/**
 * Verifies a configured database (DATABASE_URL): lists tables and row
 * counts, checks the seeded admin exists. Never prints credentials.
 * Run: npx tsx scripts/verify-db.ts
 */
import { query, closePool } from '../src/db/pool.js';

async function main() {
  const tables = await query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' ORDER BY table_name`,
  );
  console.log('[verify] tables:', tables.rows.map((r) => r.table_name).join(', '));

  const counts = await query<{ services: number; faqs: number; plans: number; testimonials: number; users: number; bookings: number }>(
    `SELECT (SELECT COUNT(*)::int FROM services) AS services,
            (SELECT COUNT(*)::int FROM faqs) AS faqs,
            (SELECT COUNT(*)::int FROM pricing_plans) AS plans,
            (SELECT COUNT(*)::int FROM testimonials) AS testimonials,
            (SELECT COUNT(*)::int FROM users) AS users,
            (SELECT COUNT(*)::int FROM bookings) AS bookings`,
  );
  console.log('[verify] counts:', counts.rows[0]);

  const admin = await query<{ email: string; role: string }>(
    `SELECT email, role FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1`,
  );
  if (!admin.rows[0]) throw new Error('No admin user found — run db:seed');
  console.log('[verify] admin user:', admin.rows[0].email, `(${admin.rows[0].role})`);

  const sample = await query<{ slug: string }>(
    'SELECT slug FROM services WHERE is_active = TRUE ORDER BY sort_order LIMIT 3',
  );
  console.log('[verify] sample services:', sample.rows.map((r) => r.slug).join(', '));
  console.log('[verify] DATABASE OK');
  await closePool();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('[verify] FAILED:', err instanceof Error ? err.message : err);
  await closePool().catch(() => undefined);
  process.exit(1);
});
