import { Router } from 'express';
import { query } from '../db/pool.js';
import { ok } from '../utils/http.js';

const router = Router();

/** GET /api/faqs?category=General */
router.get('/faqs', async (req, res, next) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const { rows } = await query(
      `SELECT id, question, answer, category FROM faqs
       WHERE is_active = TRUE AND ($1 = '' OR category = $1)
       ORDER BY sort_order ASC, question ASC`,
      [category],
    );
    return ok(res, { faqs: rows });
  } catch (e) { next(e); }
});

/** GET /api/pricing */
router.get('/pricing', async (_req, res, next) => {
  try {
    const { rows } = await query<{
      id: string; slug: string; name: string; description: string;
      price_label: string; unit: string; features: string[];
      is_highlighted: boolean; badge: string | null;
    }>('SELECT * FROM pricing_plans ORDER BY sort_order ASC');
    return ok(res, {
      plans: rows.map((r) => ({
        id: r.slug, name: r.name, description: r.description,
        price: r.price_label, unit: r.unit,
        features: Array.isArray(r.features) ? r.features : [],
        highlighted: r.is_highlighted, badge: r.badge ?? undefined,
      })),
    });
  } catch (e) { next(e); }
});

/** GET /api/stats — headline counters for the home page */
router.get('/stats', async (_req, res, next) => {
  try {
    const [jobs, reviews, services] = await Promise.all([
      query<{ n: string }>(`SELECT COUNT(*)::text AS n FROM bookings WHERE status = 'completed'`),
      query<{ avg: string | null; n: string }>(
        `SELECT COALESCE(ROUND(AVG(rating),1),0)::text AS avg, COUNT(*)::text AS n FROM testimonials WHERE is_approved = TRUE`,
      ),
      query<{ n: string }>(`SELECT COUNT(*)::text AS n FROM services WHERE is_active = TRUE`),
    ]);
    const completed = Number(jobs.rows[0]?.n || 0);
    return ok(res, {
      stats: [
        { value: 18, suffix: '+', label: 'Years of Experience' },
        { value: 15000 + completed, suffix: '+', label: 'Completed Jobs' },
        { value: Number(reviews.rows[0]?.n || 0) + 2400, suffix: '+', label: 'Happy Customers' },
        { value: 45, suffix: '+', label: 'Expert Technicians' },
      ],
      averageRating: Number(reviews.rows[0]?.avg || 5),
    });
  } catch (e) { next(e); }
});

export default router;
