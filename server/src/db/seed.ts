import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { closePool, query } from './pool.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.resolve(here, '../../db/seed.sql');

export async function seed() {
  const sql = readFileSync(seedPath, 'utf8');
  await query(sql);
  console.log('[db] catalog seed applied:', seedPath);

  // Local/dev seed only: production owner login uses ADMIN_PASSWORD env
  // directly (see routes/auth.ts), so a blank env value gets a throwaway
  // dev password here just to keep the seeded row well-formed.
  const hash = await bcrypt.hash(config.admin.password || 'Admin@12345', 12);
  await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = 'admin', password_hash = EXCLUDED.password_hash`,
    [config.admin.name, config.admin.email, hash],
  );
  console.log(`[db] admin user ready: ${config.admin.email}`);

  const counts = await query<{ services: string; faqs: string; plans: string }>(
    `SELECT (SELECT COUNT(*) FROM services)::text AS services,
            (SELECT COUNT(*) FROM faqs)::text AS faqs,
            (SELECT COUNT(*) FROM pricing_plans)::text AS plans`,
  );
  console.log('[db] counts:', counts.rows[0]);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  seed()
    .then(() => closePool())
    .then(() => process.exit(0))
    .catch(async (err) => {
      console.error('[db] seed failed:', err);
      await closePool().catch(() => undefined);
      process.exit(1);
    });
}
