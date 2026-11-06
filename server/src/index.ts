import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
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
