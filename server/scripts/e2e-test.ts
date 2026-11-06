/**
 * End-to-end API test against in-memory PostgreSQL (pg-mem).
 * Run: npx tsx scripts/e2e-test.ts
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { newDb } from 'pg-mem';

process.env.PORT = '4100';
process.env.JWT_SECRET = 'e2e-test-secret';

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
  await query(
    schema.slice(0, schema.indexOf(marker)).replace(/CREATE EXTENSION[^;]*;/, ''),
  );
  const { seed } = await import('../src/db/seed.js');
  await seed();

  await import('../src/index.js');
  await new Promise((r) => setTimeout(r, 800));

  const base = 'http://localhost:4100/api';
  const call = async (method: string, url: string, body?: unknown, token?: string) => {
    const res = await fetch(`${base}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json() };
  };
  const check = (name: string, cond: boolean, extra?: unknown) => {
    if (!cond) throw new Error(`FAILED: ${name} ${JSON.stringify(extra ?? '')}`);
    console.log('[e2e] ok —', name);
  };

  const health = await call('GET', '/health');
  check('health', health.status === 200 && health.body.data.db === 'connected', health.body);

  const services = await call('GET', '/services');
  check('services list = 14', services.body.data.services.length === 14);

  const plumbing = await call('GET', '/services?category=plumbing');
  check('services filter plumbing = 7', plumbing.body.data.services.length === 7, plumbing.body.data.services.length);

  const detail = await call('GET', '/services/leak-detection');
  check('service detail', detail.body.data.service.slug === 'leak-detection');

  const missing = await call('GET', '/services/nope');
  check('service 404', missing.status === 404);

  const reg = await call('POST', '/auth/register', {
    name: 'E2E Tester', email: 'e2e@example.com', password: 'Password@1', phone: '555-0100',
  });
  check('register', reg.status === 201 && !!reg.body.data.token, reg.body);
  const token = reg.body.data.token as string;

  const badLogin = await call('POST', '/auth/login', { email: 'e2e@example.com', password: 'wrong' });
  check('login rejects bad password', badLogin.status === 401);

  const booking = await call('POST', '/bookings', {
    name: 'E2E Tester', email: 'e2e@example.com', phone: '555-0100',
    serviceType: 'plumbing', serviceSlug: 'leak-detection',
    date: '2026-12-01', time: 'morning', urgency: 'urgent', description: 'Kitchen leak',
  }, token);
  check('create booking', booking.status === 201 && booking.body.data.booking.status === 'pending', booking.body);
  const bookingId = booking.body.data.booking.id as string;

  const mine = await call('GET', '/bookings/me', undefined, token);
  check('my bookings', mine.body.data.bookings.length === 1);

  const msg = await call('POST', '/contact', {
    name: 'E2E Tester', email: 'e2e@example.com', message: 'Hello ProFix, need a quote please.',
  });
  check('contact message', msg.status === 201);

  const review = await call('POST', '/testimonials', { rating: 5, text: 'Excellent service, highly recommended!', service: 'Leak Detection' }, token);
  check('submit review', review.status === 201, review.body);

  const adminLogin = await call('POST', '/auth/login', { email: 'admin@profixservices.com', password: process.env.ADMIN_PASSWORD || 'Admin@12345' });
  check('admin login', adminLogin.status === 200 && adminLogin.body.data.user.role === 'admin', adminLogin.body);
  const adminToken = adminLogin.body.data.token as string;

  // Neon bridge: a Neon-signed-in customer exchanges identity for an API
  // token that passes requireAuth, and can then read their bookings.
  const bridge = await call('POST', '/auth/neon', { name: 'E2E Tester', email: 'e2e@example.com' });
  check('neon bridge returns token', bridge.status === 200 && !!bridge.body.data.token, bridge.body);
  const bridged = await call('GET', '/bookings/me', undefined, bridge.body.data.token as string);
  check('bridged token reads bookings', bridged.status === 200 && bridged.body.data.bookings.length === 1, bridged.body);

  const bridgeNew = await call('POST', '/auth/neon', { name: 'Neon Newbie', email: 'neon-new@example.com', phone: '555-0199' });
  check('neon bridge creates customer', bridgeNew.status === 201 && bridgeNew.body.data.user.role === 'customer', bridgeNew.body);

  const bridgeAdmin = await call('POST', '/auth/neon', { name: 'Boss', email: 'admin@profixservices.com' });
  check('neon bridge refuses admin email', bridgeAdmin.status === 403, bridgeAdmin.body);

  const updated = await call('PATCH', `/bookings/${bookingId}`, { status: 'confirmed' }, adminToken);
  check('admin confirms booking', updated.body.data.booking.status === 'confirmed', updated.body);

  const stats = await call('GET', '/admin/stats', undefined, adminToken);
  check('admin stats', stats.body.data.stats.totalBookings === 1, stats.body);

  const forbidden = await call('GET', '/admin/stats', undefined, token);
  check('customer blocked from admin', forbidden.status === 403);

  const invalid = await call('POST', '/bookings', { name: 'X' });
  check('validation 422', invalid.status === 422, invalid.body);

  console.log('[e2e] ALL PASSED');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
