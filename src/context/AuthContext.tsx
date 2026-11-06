import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiLogin, apiMe, tokenStore } from '@/lib/api';
import { isNeonAuthConfigured, neonAuth } from '@/lib/neon-auth';
import type { AuthUser } from '@/types';

/**
 * Two sign-in systems, kept deliberately separate:
 *
 * - Customers use Neon Auth. The browser client (src/lib/neon-auth.ts)
 *   talks to the Neon Auth base URL and keeps the session in Neon Auth
 *   cookies; the ProFix API is not involved in customer sign-in.
 * - The site admin uses the ProFix API's JWT login (the API signs tokens
 *   with JWT_SECRET). That flow is only reachable from the unlinked
 *   /loginadmin page and stores its token in localStorage.
 */

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  /** Customer sign-in via Neon Auth cookies. */
  login: (email: string, password: string) => Promise<AuthUser>;
  /** Customer sign-up via Neon Auth. */
  register: (input: { name: string; email: string; phone?: string; password: string }) => Promise<AuthUser>;
  /** Admin sign-in via the ProFix API JWT (used only by /loginadmin). */
  adminLogin: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateProfile: (input: { name?: string; phone?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function neonUserToAuthUser(u: { id: string; name: string; email: string }): AuthUser {
  return { id: u.id, name: u.name, email: u.email, phone: null, role: 'customer' };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 1) Admin session (ProFix API JWT in localStorage)?
      if (tokenStore.get()) {
        try {
          const me = await apiMe();
          if (!cancelled) {
            setUser(me);
            setLoading(false);
          }
          return;
        } catch {
          tokenStore.clear();
        }
      }
      // 2) Customer session (Neon Auth cookie)?
      if (isNeonAuthConfigured && neonAuth) {
        try {
          const { data } = await neonAuth.getSession();
          if (!cancelled && data?.user) {
            setUser(neonUserToAuthUser(data.user));
          }
        } catch {
          /* no customer session — stay signed out */
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!neonAuth) {
      throw new Error('Customer sign-in is not configured yet (missing VITE_NEON_AUTH_URL).');
    }
    const { error } = await neonAuth.signIn.email({ email, password });
    if (error) throw new Error(error.message || 'Invalid email or password.');
    const { data } = await neonAuth.getSession();
    if (!data?.user) throw new Error('Sign-in succeeded but no session was returned. Please try again.');
    const u = neonUserToAuthUser(data.user);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; phone?: string; password: string }) => {
      if (!neonAuth) {
        throw new Error('Customer sign-up is not configured yet (missing VITE_NEON_AUTH_URL).');
      }
      const { error } = await neonAuth.signUp.email({
        email: input.email,
        password: input.password,
        name: input.name,
      });
      if (error) throw new Error(error.message || 'Could not create your account.');
      // Neon Auth signs the new user in automatically in most setups; if a
      // session is not present (e.g. email verification required), fall back
      // to an explicit sign-in so the UX stays in one step.
      let { data } = await neonAuth.getSession();
      if (!data?.user) {
        const signIn = await neonAuth.signIn.email({ email: input.email, password: input.password });
        if (signIn.error) {
          throw new Error('Account created. Please verify your email, then log in.');
        }
        ({ data } = await neonAuth.getSession());
      }
      if (!data?.user) throw new Error('Account created. Please log in to continue.');
      const u = neonUserToAuthUser(data.user);
      setUser(u);
      return u;
    },
    [],
  );

  const adminLogin = useCallback(async (email: string, password: string) => {
    const { user: u } = await apiLogin({ email, password });
    if (u.role !== 'admin') {
      tokenStore.clear();
      throw new Error('This account does not have admin access.');
    }
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    if (tokenStore.get()) {
      tokenStore.clear();
      setUser(null);
      return;
    }
    try {
      await neonAuth?.signOut();
    } catch {
      /* session already gone */
    }
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (input: { name?: string; phone?: string }) => {
      if (!user) return;
      if (user.role === 'admin') {
        // Admin profile lives in the ProFix API users table.
        const { apiUpdateMe } = await import('@/lib/api');
        const u = await apiUpdateMe(input);
        setUser(u);
        return;
      }
      // Customer profile lives in Neon Auth.
      if (input.name && neonAuth?.updateUser) {
        const { error } = await neonAuth.updateUser({ name: input.name });
        if (error) throw new Error(error.message || 'Could not update your profile.');
      }
      setUser({ ...user, name: input.name ?? user.name, phone: input.phone ?? user.phone });
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, isAdmin: user?.role === 'admin', login, register, adminLogin, logout, updateProfile }),
    [user, loading, login, register, adminLogin, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
