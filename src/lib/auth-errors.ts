/**
 * Human-friendly Neon Auth error messages.
 *
 * Neon Auth (Better Auth) checks the browser `Origin` header against its
 * trusted-domain allowlist with an EXACT string match. The browser sends
 * e.g. `https://profix-web-lovat.vercel.app` (no trailing slash, no path),
 * so an allowlist entry typed as `https://profix-web-lovat.vercel.app/`
 * never matches and every sign-up/sign-in fails with `403 Invalid origin`.
 * The allowlist is also per Neon branch: the domain must be added on the
 * branch that owns the Auth URL this site was built with.
 *
 * Because of that, the invalid-origin message shows the exact origin the
 * visitor is on right now, ready to copy-paste into
 * Neon Console -> (that branch) -> Auth -> Configuration -> Domains.
 */
export function currentOrigin(): string {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

export function isInvalidOriginError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  return /invalid origin/i.test(raw);
}

export function friendlyAuthError(err: unknown, fallback = 'Please try again.'): string {
  const raw = err instanceof Error ? err.message : '';
  if (isInvalidOriginError(err)) {
    const origin = currentOrigin();
    return (
      `Neon Auth does not trust this site address yet. In Neon Console, open the branch ` +
      `that owns your Auth URL -> Auth -> Configuration -> Domains and add exactly: ` +
      `${origin} — copy it as-is, with NO trailing slash. Then reload and try again.`
    );
  }
  return raw || fallback;
}
