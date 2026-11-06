import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { closePool, query } from './pool.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(here, '../../db/schema.sql');

export async function migrate() {
  const sql = readFileSync(schemaPath, 'utf8');
  await query(sql);
  console.log('[db] schema applied:', schemaPath);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  migrate()
    .then(() => closePool())
    .then(() => process.exit(0))
    .catch(async (err) => {
      console.error('[db] migration failed:', err);
      await closePool().catch(() => undefined);
      process.exit(1);
    });
}
