import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';
import { ApiError, notFound, ok } from '../utils/http.js';

const router = Router();

const STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;

const createSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  email: z.string().trim().email('Enter a valid email').max(254).optional().or(z.literal('')),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(40),
  address: z.string().trim().max(300).optional().or(z.literal('')),
  serviceType: z.enum(['plumbing', 'electrical', 'emergency']).default('plumbing'),
  serviceSlug: z.string().trim().max(80).optional().or(z.literal('')),
  service: z.string().trim().max(80).optional().or(z.literal('')), // alias of serviceSlug
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().or(z.literal('')),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  time: z.string().trim().max(40).optional().or(z.literal('')),
  preferredTime: z.string().trim().max(40).optional().or(z.literal('')),
  urgency: z.enum(['normal', 'urgent', 'emergency']).default('normal'),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
});

interface BookingRow {
  id: string; user_id: string | null; service_id: string | null; service_slug: string | null;
  name: string; email: string | null; phone: string; address: string | null;
  service_type: string; preferred_date: string | null; preferred_time: string | null;
  urgency: string; description: string | null; status: string;
  assigned_to: string | null; admin_notes: string | null;
  created_at: string; updated_at: string;
}

function mapBooking(r: BookingRow) {
  return {
    id: r.id, userId: r.user_id, serviceId: r.service_id, serviceSlug: r.service_slug,
    name: r.name, email: r.email, phone: r.phone, address: r.address,
    serviceType: r.service_type, date: r.preferred_date, time: r.preferred_time,
    urgency: r.urgency, description: r.description, status: r.status,
    assignedTo: r.assigned_to, adminNotes: r.admin_notes,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

/** POST /api/bookings — public; attaches user when a token is sent */
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const b = createSchema.parse(req.body);
    const slug = b.serviceSlug || b.service || null;
    let serviceId: string | null = null;
    if (slug) {
      const svc = await query<{ id: string }>('SELECT id FROM services WHERE slug = $1', [slug]);
      serviceId = svc.rows[0]?.id ?? null;
    }
    const { rows } = await query<BookingRow>(
      `INSERT INTO bookings
         (user_id, service_id, service_slug, name, email, phone, address,
          service_type, preferred_date, preferred_time, urgency, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [req.user?.id ?? null, serviceId, slug, b.name, b.email || null, b.phone, b.address || null,
       b.serviceType, (b.preferredDate || b.date) || null, (b.preferredTime || b.time) || null,
       b.urgency, b.description || null],
    );
    return ok(res, { booking: mapBooking(rows[0]) }, 201);
  } catch (e) { next(e); }
});

/** GET /api/bookings/me — the logged-in user's bookings */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query<BookingRow>(
      'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user!.id],
    );
    return ok(res, { bookings: rows.map(mapBooking) });
  } catch (e) { next(e); }
});

/** GET /api/bookings — admin only, ?status=&q= */
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : '';
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const { rows } = await query<BookingRow>(
      `SELECT * FROM bookings
       WHERE ($1 = '' OR status = $1)
         AND ($2 = '' OR name ILIKE '%' || $2 || '%' OR phone ILIKE '%' || $2 || '%'
              OR COALESCE(email,'') ILIKE '%' || $2 || '%')
       ORDER BY created_at DESC LIMIT 200`,
      [status, q],
    );
    return ok(res, { bookings: rows.map(mapBooking) });
  } catch (e) { next(e); }
});

/** PATCH /api/bookings/:id/cancel — owner or admin */
router.patch('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query<BookingRow>('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    const booking = rows[0];
    if (!booking) throw notFound('Booking');
    if (req.user!.role !== 'admin' && booking.user_id !== req.user!.id) {
      throw new ApiError(403, 'FORBIDDEN', 'You can only cancel your own bookings.');
    }
    if (booking.status === 'completed') {
      throw new ApiError(422, 'INVALID_STATE', 'A completed booking cannot be cancelled.');
    }
    const upd = await query<BookingRow>(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [req.params.id],
    );
    return ok(res, { booking: mapBooking(upd.rows[0]) });
  } catch (e) { next(e); }
});

const adminUpdateSchema = z.object({
  status: z.enum(STATUSES).optional(),
  assignedTo: z.string().trim().max(120).optional().or(z.literal('')),
  adminNotes: z.string().trim().max(2000).optional().or(z.literal('')),
});

/** PATCH /api/bookings/:id — admin: status / assignment / notes */
router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const b = adminUpdateSchema.parse(req.body);
    const { rows } = await query<BookingRow>(
      `UPDATE bookings SET
         status = COALESCE($1, status),
         assigned_to = COALESCE($2, assigned_to),
         admin_notes = COALESCE($3, admin_notes)
       WHERE id = $4 RETURNING *`,
      [b.status ?? null, b.assignedTo || null, b.adminNotes || null, req.params.id],
    );
    if (!rows[0]) throw notFound('Booking');
    return ok(res, { booking: mapBooking(rows[0]) });
  } catch (e) { next(e); }
});

export default router;
