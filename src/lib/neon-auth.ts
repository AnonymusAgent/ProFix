import { createAuthClient } from '@neondatabase/auth';
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters';

/**
 * Customer authentication is handled by Neon Auth (Better Auth under the
 * hood). The browser client talks straight to the Neon Auth base URL and
 * keeps the session in Neon Auth cookies — no ProFix API token is issued
 * for customers.
 *
 * Configure with VITE_NEON_AUTH_URL (Vercel → profix-web → Environment
 * Variables). The admin console does NOT use this client; it uses the
 * ProFix API's JWT login instead (see AuthContext.adminLogin).
 */

const NEON_AUTH_URL = (import.meta.env.VITE_NEON_AUTH_URL as string | undefined)?.replace(/\/$/, '');

export const isNeonAuthConfigured = Boolean(NEON_AUTH_URL);

interface NeonSessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface NeonAuthClientLike {
  signIn: {
    email: (input: { email: string; password: string }) => Promise<{ data?: unknown; error?: { message?: string } | null }>;
  };
  signUp: {
    email: (input: {
      email: string;
      password: string;
      name: string;
    }) => Promise<{ data?: unknown; error?: { message?: string } | null }>;
  };
  getSession: () => Promise<{ data?: { user?: NeonSessionUser } | null; error?: { message?: string } | null }>;
  signOut: () => Promise<unknown>;
  updateUser?: (input: { name?: string }) => Promise<{ error?: { message?: string } | null }>;
}

export const neonAuth: NeonAuthClientLike | null = NEON_AUTH_URL
  ? (createAuthClient(NEON_AUTH_URL, {
      adapter: BetterAuthReactAdapter(),
    }) as unknown as NeonAuthClientLike)
  : null;

export type { NeonSessionUser };
