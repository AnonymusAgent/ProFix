/**
 * Demo server: full API backed by in-memory PostgreSQL (pg-mem).
 * Data resets on restart. For real persistence use Neon — see README.md.
 * Run: npm run dev:memory   (listens on PORT, default 4000)
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { newDb } from 'pg-mem';

process.env.PORT = process.env.PORT || '4000';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'preview-demo-secret';

const here = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const db = newDb();
  db.public.registerFunction({
    name: 'gen_random_uuid',
    returns: 'uuid' as never,
    impure: true,
    implementation: () =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }) as never,
  });
  const { Pool } = db.adapters.createPg();
  const { setPool, query } = await import('../src/db/pool.js');
  setPool(new Pool() as never);

  const schema = readFileSync(path.resolve(here, '../db/schema.sql'), 'utf8');
  const marker = '-- ---------- updated_at helper ----------';
  await query(schema.slice(0, schema.indexOf(marker)).replace(/CREATE EXTENSION[^;]*;/, ''));
  const { seed } = await import('../src/db/seed.js');
  await seed();
  console.log('[preview] in-memory database seeded (demo data resets on restart)');
  await import('../src/index.js');
}

main().catch((err) => {
  console.error('[preview] failed:', err);
  process.exit(1);
});
