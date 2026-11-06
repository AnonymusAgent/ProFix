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
    email: (process.env.ADMIN_EMAIL || 'admin@profixservices.com').toLowerCase(),
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
  },
} as const;

export const isDbConfigured = () => config.databaseUrl.length > 0;
