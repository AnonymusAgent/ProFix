import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { requireAdmin } from '../middleware/auth.js';
import { notFound, ok } from '../utils/http.js';

const router = Router();

const messageSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  email: z.string().trim().email('Enter a valid email address').max(254),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  subject: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(5, 'Message is too short').max(5000),
});

/** POST /api/contact — public contact form */
router.post('/contact', async (req, res, next) => {
  try {
    const b = messageSchema.parse(req.body);
    const { rows } = await query(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at`,
      [b.name, b.email, b.phone || null, b.subject || null, b.message],
    );
    return ok(res, { message: { id: rows[0].id, createdAt: rows[0].created_at } }, 201);
  } catch (e) { next(e); }
});

/** GET /api/contact — admin inbox */
router.get('/contact', requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200',
    );
    return ok(res, {
      messages: rows.map((r) => ({
        id: r.id, name: r.name, email: r.email, phone: r.phone,
        subject: r.subject, message: r.message, isRead: r.is_read, createdAt: r.created_at,
      })),
    });
  } catch (e) { next(e); }
});

/** PATCH /api/contact/:id/read — admin */
router.patch('/contact/:id/read', requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await query(
      'UPDATE contact_messages SET is_read = TRUE WHERE id = $1 RETURNING id',
      [req.params.id],
    );
    if (!rows[0]) throw notFound('Message');
    return ok(res, { updated: true });
  } catch (e) { next(e); }
});

const newsletterSchema = z.object({
  email: z.string().trim().email('Enter a valid email address').max(254).transform((v) => v.toLowerCase()),
});

/** POST /api/newsletter — public subscribe (idempotent) */
router.post('/newsletter', async (req, res, next) => {
  try {
    const { email } = newsletterSchema.parse(req.body);
    await query(
      `INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
      [email],
    );
    return ok(res, { subscribed: true }, 201);
  } catch (e) { next(e); }
});

export default router;
