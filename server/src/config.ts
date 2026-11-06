import 'dotenv/config';

function requiredInProd(name: string, fallback: string): string {
  const v = process.env[name];
  if (v && v.trim()) return v.trim();
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return fallback;
}

export const config = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: (process.env.DATABASE_URL || '').trim(),
  jwtSecret: requiredInProd('JWT_SECRET', 'dev-only-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:8080,http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  admin: {
    name: process.env.ADMIN_NAME || 'ProFix Admin',
    // Owner admin login: this email + the password from the ADMIN_PASSWORD
    // environment variable (Vercel -> profix-backend -> Environment
    // Variables). The password is NEVER hardcoded in the repo; when
    // ADMIN_PASSWORD is unset, owner-email password login is disabled.
    // JWT_SECRET is unrelated to this password — it only signs session
    // tokens after any successful login and must always stay set.
    email: (process.env.ADMIN_EMAIL || 'alimukhtar@profix.com').trim().toLowerCase(),
    password: (process.env.ADMIN_PASSWORD || '').trim(),
  },
} as const;

export const isDbConfigured = () => config.databaseUrl.length > 0;
