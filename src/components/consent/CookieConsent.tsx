import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  COOKIE_SETTINGS_EVENT, getCookieConsent, saveCookieConsent,
} from '@/lib/consent';

/**
 * Cookie consent banner.
 *
 * Essential cookies (sign-in sessions + analytics) are always allowed and
 * locked on — visitors can only choose whether marketing cookies are on
 * or off, like most production websites. The choice can be changed any
 * time via "Cookie Settings" in the footer.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    const stored = getCookieConsent();
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
    setMarketing(stored.marketing);
    return undefined;
  }, []);

  useEffect(() => {
    const open = () => {
      const stored = getCookieConsent();
      setMarketing(stored?.marketing ?? true);
      setVisible(true);
    };
    window.addEventListener(COOKIE_SETTINGS_EVENT, open);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, open);
  }, []);

  if (!visible) return null;

  const save = (value: boolean) => {
    saveCookieConsent(value);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-3xl bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex items-center justify-center size-10 rounded-xl bg-brand-orange/15 text-brand-orange shrink-0">
            <Cookie className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display font-bold text-foreground">We value your privacy</h2>
              <button
                onClick={() => save(marketing)}
                aria-label="Close cookie settings"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              We use cookies to run the site and understand how it&apos;s used. Read our{' '}
              <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
            </p>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">Essential &amp; analytics cookies</p>
                  <p className="text-xs text-muted-foreground">Required for sign-in, security and site analytics. Always active.</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 shrink-0">
                  <Lock className="size-3.5" /> Always on
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">Marketing cookies</p>
                  <p className="text-xs text-muted-foreground">Used for promotions and measuring ad campaigns. Your choice.</p>
                </div>
                <button
                  role="switch"
                  aria-checked={marketing}
                  aria-label="Marketing cookies"
                  onClick={() => setMarketing((v) => !v)}
                  className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${
                    marketing ? 'bg-brand-orange' : 'bg-muted-foreground/40'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
                      marketing ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => save(marketing)} className="bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
                Save my choices
              </Button>
              <Button variant="outline" onClick={() => save(true)}>
                Accept all
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
