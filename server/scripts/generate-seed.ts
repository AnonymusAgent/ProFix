/**
 * Generates server/db/seed.sql from the frontend catalog
 * (src/constants/mockData.ts) so the DB seed can never drift
 * from what the site displays. Run: npx tsx src/db/generate-seed.ts
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-expect-error importing frontend TS source for data generation only
import { SERVICES, TESTIMONIALS, FAQ_DATA, PRICING_PLANS } from '../../src/constants/mockData.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../db/seed.sql');

const esc = (v: string) => `'${v.replace(/'/g, "''")}'`;
const escOrNull = (v?: string) => (v ? esc(v) : 'NULL');
const cents = (price?: string) => {
  const m = price?.match(/(\d+)/);
  return m ? String(Number(m[1]) * 100) : 'NULL';
};

const lines: string[] = [
  '-- ============================================================',
  '-- ProFix — seed data (generated from src/constants/mockData.ts',
  '-- by server/scripts/generate-seed.ts — do not edit by hand)',
  '-- Idempotent: safe to run repeatedly (upserts on unique keys).',
  '-- ============================================================',
  '',
  '-- ---------- services ----------',
];

SERVICES.forEach((s: (typeof SERVICES)[number], i: number) => {
  lines.push(
    `INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, sort_order)`,
    `VALUES (${esc(s.id)}, ${esc(s.title)}, ${esc(s.description)}, ${esc(s.icon)}, ${esc(s.category)}, ${esc(JSON.stringify(s.features))}::jsonb, ${escOrNull(s.image)}, ${escOrNull(s.price)}, ${cents(s.price)}, ${i})`,
    `ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,`,
    `  icon = EXCLUDED.icon, category = EXCLUDED.category, features = EXCLUDED.features,`,
    `  image = EXCLUDED.image, price_label = EXCLUDED.price_label, price_cents = EXCLUDED.price_cents,`,
    `  sort_order = EXCLUDED.sort_order, is_active = TRUE;`,
    '',
  );
});

lines.push('-- ---------- testimonials ----------');
TESTIMONIALS.forEach((t: (typeof TESTIMONIALS)[number]) => {
  lines.push(
    `INSERT INTO testimonials (name, role, avatar, rating, text, service)`,
    `SELECT ${esc(t.name)}, ${esc(t.role)}, ${escOrNull(t.avatar)}, ${t.rating}, ${esc(t.text)}, ${escOrNull(t.service)}`,
    `WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = ${esc(t.name)} AND text = ${esc(t.text)});`,
    '',
  );
});

lines.push('-- ---------- faqs ----------');
FAQ_DATA.forEach((f: (typeof FAQ_DATA)[number], i: number) => {
  lines.push(
    `INSERT INTO faqs (question, answer, category, sort_order)`,
    `SELECT ${esc(f.question)}, ${esc(f.answer)}, ${esc(f.category)}, ${i}`,
    `WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = ${esc(f.question)});`,
    '',
  );
});

lines.push('-- ---------- pricing plans ----------');
PRICING_PLANS.forEach((p: (typeof PRICING_PLANS)[number], i: number) => {
  lines.push(
    `INSERT INTO pricing_plans (slug, name, description, price_label, unit, features, is_highlighted, badge, sort_order)`,
    `VALUES (${esc(p.id)}, ${esc(p.name)}, ${esc(p.description)}, ${esc(p.price)}, ${esc(p.unit)}, ${esc(JSON.stringify(p.features))}::jsonb, ${p.highlighted ? 'TRUE' : 'FALSE'}, ${escOrNull(p.badge)}, ${i})`,
    `ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,`,
    `  price_label = EXCLUDED.price_label, unit = EXCLUDED.unit, features = EXCLUDED.features,`,
    `  is_highlighted = EXCLUDED.is_highlighted, badge = EXCLUDED.badge, sort_order = EXCLUDED.sort_order;`,
    '',
  );
});

writeFileSync(out, lines.join('\n'));
console.log('[db] seed written:', out);
