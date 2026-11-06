import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAdmin } from '../middleware/auth.js';
import { ApiError, notFound, ok } from '../utils/http.js';

const router = Router();

export interface ServiceRow {
  id: string; slug: string; title: string; description: string; icon: string;
  category: string; features: string[]; image: string | null;
  price_label: string | null; price_cents: number | null;
  is_active: boolean; sort_order: number; created_at: string; updated_at: string;
}

export function mapService(r: ServiceRow) {
  return {
    id: r.id, slug: r.slug, title: r.title, description: r.description,
    icon: r.icon, category: r.category,
    features: Array.isArray(r.features) ? r.features : [],
    image: r.image, price: r.price_label, priceCents: r.price_cents,
    isActive: r.is_active, sortOrder: r.sort_order,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

/** GET /api/services?category=plumbing&q=leak — public, active only */
router.get('/', async (req, res, next) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const { rows } = await query<ServiceRow>(
      `SELECT * FROM services
       WHERE is_active = TRUE
         AND ($1 = '' OR category = $1)
         AND ($2 = '' OR title ILIKE '%' || $2 || '%' OR description ILIKE '%' || $2 || '%')
       ORDER BY sort_order ASC, title ASC`,
      [category, q],
    );
    return ok(res, { services: rows.map(mapService) });
  } catch (e) { next(e); }
});

/** GET /api/services/:slug — public */
router.get('/:slug', async (req, res, next) => {
  try {
    const { rows } = await query<ServiceRow>(
      'SELECT * FROM services WHERE slug = $1 AND is_active = TRUE',
      [req.params.slug],
    );
    if (!rows[0]) throw notFound('Service');
    return ok(res, { service: mapService(rows[0]) });
  } catch (e) { next(e); }
});

const serviceSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case').max(80),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(2000),
  icon: z.string().trim().max(60).default('Wrench'),
  category: z.enum(['plumbing', 'electrical']),
  features: z.array(z.string().trim().min(1).max(120)).max(12).default([]),
  image: z.string().trim().url().max(1000).optional().or(z.literal('')),
  priceLabel: z.string().trim().max(60).optional().or(z.literal('')),
  priceCents: z.number().int().nonnegative().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/** POST /api/services — admin */
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const b = serviceSchema.parse(req.body);
    const { rows } = await query<ServiceRow>(
      `INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,COALESCE($10,TRUE),COALESCE($11,0)) RETURNING *`,
      [b.slug, b.title, b.description, b.icon, b.category, JSON.stringify(b.features),
       b.image || null, b.priceLabel || null, b.priceCents ?? null, b.isActive ?? null, b.sortOrder ?? null],
    );
    return ok(res, { service: mapService(rows[0]) }, 201);
  } catch (e) { next(e); }
});

/** PATCH /api/services/:id — admin */
router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const b = serviceSchema.partial().parse(req.body);
    const { rows } = await query<ServiceRow>(
      `UPDATE services SET
         slug = COALESCE($1, slug), title = COALESCE($2, title),
         description = COALESCE($3, description), icon = COALESCE($4, icon),
         category = COALESCE($5, category),
         features = CASE WHEN $6::text IS NULL THEN features ELSE $6::jsonb END,
         image = COALESCE($7, image), price_label = COALESCE($8, price_label),
         price_cents = COALESCE($9, price_cents),
         is_active = COALESCE($10, is_active), sort_order = COALESCE($11, sort_order)
       WHERE id = $12 RETURNING *`,
      [b.slug ?? null, b.title ?? null, b.description ?? null, b.icon ?? null, b.category ?? null,
       b.features ? JSON.stringify(b.features) : null, b.image || null, b.priceLabel || null,
       b.priceCents ?? null, b.isActive ?? null, b.sortOrder ?? null, req.params.id],
    );
    if (!rows[0]) throw notFound('Service');
    return ok(res, { service: mapService(rows[0]) });
  } catch (e) { next(e); }
});

/** DELETE /api/services/:id — admin (soft-delete: deactivate) */
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await query<ServiceRow>(
      'UPDATE services SET is_active = FALSE WHERE id = $1 RETURNING *',
      [req.params.id],
    );
    if (!rows[0]) throw notFound('Service');
    return ok(res, { service: mapService(rows[0]) });
  } catch (e) { next(e); }
});

export default router;
