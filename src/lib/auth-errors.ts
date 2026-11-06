/**
 * Human-friendly Neon Auth error messages.
 *
 * Neon Auth (Better Auth) checks the browser `Origin` header against its
 * trusted-domain allowlist with an EXACT string match. The browser sends
 * e.g. `https://pro-fix-web.vercel.app` (no trailing slash, no path),
 * so an allowlist entry typed as `https://pro-fix-web.vercel.app/`
 * never matches and every sign-up/sign-in fails with `403 Invalid origin`.
 * The allowlist is also per Neon branch: the domain must be added on the
 * branch that owns the Auth URL this site was built with.
 *
 * Because of that, the invalid-origin message shows the exact origin the
 * visitor is on right now, ready to copy-paste into
 * Neon Console -> (that branch) -> Auth -> Configuration -> Domains.
 *
 * Two Neon-side gates can reject auth before app code runs: the trusted
 * domain above, and the branch's email/password sign-up switch. Both get
 * plain-English messages here naming the exact Neon Console fix.
 */
export function currentOrigin(): string {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

export function isInvalidOriginError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  return /invalid origin/i.test(raw);
}

/**
 * Neon Auth refuses sign-ups when the branch's email/password config has
 * sign-up switched off (`email_and_password.enabled` false, or
 * `disable_sign_up` true — CLI: `neon neon-auth config email-password
 * update --enabled` / `--disable-sign-up`). This is a Neon Console setting
 * on the same branch that owns the Auth URL; the app cannot change it.
 */
export function isSignUpDisabledError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  return /sign ?ups? are not enabled|sign-?ups? (is |are )?disabled|sign-?up.*not enabled/i.test(raw);
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
  if (isSignUpDisabledError(err)) {
    return (
      `Sign-ups are switched off in Neon Auth. In Neon Console, open the branch that owns ` +
      `your Auth URL -> Auth (Settings -> Better Auth) -> Email & Password: turn ON ` +
      `email/password sign-up ("Sign-up with Email") and make sure "Disable sign up" is OFF. ` +
      `Then reload and try again. (Login for existing users is unaffected.)`
    );
  }
  return raw || fallback;
}
