import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { notFound, ok } from '../utils/http.js';

const router = Router();

interface Row {
  id: string; name: string; role: string; avatar: string | null;
  rating: number; text: string; service: string | null;
  is_approved: boolean; created_at: string;
}

const map = (r: Row) => ({
  id: r.id, name: r.name, role: r.role, avatar: r.avatar,
  rating: r.rating, text: r.text, service: r.service,
  isApproved: r.is_approved, createdAt: r.created_at,
});

/** GET /api/testimonials — public, approved only */
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query<Row>(
      'SELECT * FROM testimonials WHERE is_approved = TRUE ORDER BY created_at DESC',
    );
    return ok(res, { testimonials: rows.map(map) });
  } catch (e) { next(e); }
});

const createSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  rating: z.number().int().min(1).max(5).default(5),
  text: z.string().trim().min(10, 'Review must be at least 10 characters').max(2000),
  service: z.string().trim().max(120).optional().or(z.literal('')),
});

/** POST /api/testimonials — logged-in customers leave a review */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const b = createSchema.parse(req.body);
    const me = await query<{ name: string }>('SELECT name FROM users WHERE id = $1', [req.user!.id]);
    const { rows } = await query<Row>(
      `INSERT INTO testimonials (user_id, name, role, rating, text, service)
       VALUES ($1,$2,'Customer',$3,$4,$5) RETURNING *`,
      [req.user!.id, b.name || me.rows[0]?.name || 'Customer', b.rating, b.text, b.service || null],
    );
    return ok(res, { testimonial: map(rows[0]) }, 201);
  } catch (e) { next(e); }
});

/** PATCH /api/testimonials/:id/approve — admin moderation */
router.patch('/:id/approve', requireAdmin, async (req, res, next) => {
  try {
    const approved = z.object({ approved: z.boolean() }).parse(req.body).approved;
    const { rows } = await query<Row>(
      'UPDATE testimonials SET is_approved = $1 WHERE id = $2 RETURNING *',
      [approved, req.params.id],
    );
    if (!rows[0]) throw notFound('Testimonial');
    return ok(res, { testimonial: map(rows[0]) });
  } catch (e) { next(e); }
});

export default router;
