/**
 * Cookie consent preferences.
 *
 * Categories (as on most production sites):
 * - Essential — always on and cannot be switched off. This includes the
 *   cookies the site needs to function (sign-in sessions) AND our
 *   first-party analytics cookies, which we treat as essential so they
 *   are never blocked.
 * - Marketing — the only optional category; the visitor can turn these
 *   off. No marketing cookies are set while this is off.
 */
export interface CookieConsentState {
  essential: true;
  analytics: true;
  marketing: boolean;
  savedAt: string;
}

const KEY = 'profix-cookie-consent';
export const COOKIE_SETTINGS_EVENT = 'profix:open-cookie-settings';

export function getCookieConsent(): CookieConsentState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    return {
      essential: true,
      analytics: true,
      marketing: Boolean(parsed.marketing),
      savedAt: parsed.savedAt || '',
    };
  } catch {
    return null;
  }
}

export function saveCookieConsent(marketing: boolean): CookieConsentState {
  const state: CookieConsentState = {
    essential: true,
    analytics: true,
    marketing,
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    // A real consent cookie too (1 year), so the choice itself is stored
    // the conventional way and survives localStorage clears.
    document.cookie = `${KEY}=${marketing ? 'marketing-on' : 'marketing-off'}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  } catch {
    /* storage unavailable — consent applies to this visit only */
  }
  return state;
}

export function openCookieSettings(): void {
  window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT));
}
