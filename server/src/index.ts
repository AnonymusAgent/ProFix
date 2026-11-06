import express from 'express';
import cors from 'cors';
import * as helmetModule from 'helmet';
import morgan from 'morgan';
import * as rateLimitModule from 'express-rate-limit';
import type { RequestHandler } from 'express';

// helmet / express-rate-limit ship CJS + ESM shapes; depending on the
// bundler's interop the callable may live on .default. Resolve it once
// here so every compiler (local tsc, Vercel) type-checks and runs.
type MiddlewareFactory = (options?: Record<string, unknown>) => RequestHandler;
const helmet = ((helmetModule as { default?: unknown }).default ?? helmetModule) as MiddlewareFactory;
const rateLimit = ((rateLimitModule as { default?: unknown }).default ?? rateLimitModule) as MiddlewareFactory;
import { config } from './config.js';
import { checkDb } from './db/pool.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { ok } from './utils/http.js';
import authRoutes from './routes/auth.js';
import servicesRoutes from './routes/services.js';
import bookingsRoutes from './routes/bookings.js';
import catalogRoutes from './routes/catalog.js';
import testimonialsRoutes from './routes/testimonials.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';
import workerRoutes from './routes/workers.js';
import reportRoutes from './routes/reports.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      // Allow non-browser clients (curl, health checks) and configured origins
      if (!origin || config.clientUrls.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' } },
});

app.get('/api/health', async (_req, res) => {
  const db = await checkDb();
  return ok(res, {
    status: 'ok',
    service: 'profix-api',
    version: '1.0.0',
    db,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', catalogRoutes); // /faqs /pricing /stats
app.use('/api', contactRoutes); // /contact /newsletter

app.use('/api', notFoundHandler);
app.use(errorHandler);

// On Vercel the app is exported as a serverless function (see
// server/api/index.ts) and must not listen on a port.
if (!process.env.VERCEL) {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[profix-api] listening on http://0.0.0.0:${config.port} (${config.nodeEnv})`);
    void checkDb().then((db) => console.log(`[profix-api] database: ${db}`));
  });
}

export default app;
