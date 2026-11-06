import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarPlus, Loader2, User, XCircle, WifiOff, Save, HardHat, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { fetchMyBookings, cancelBooking, apiWorkerMe, apiBecomeWorker, submitFraudReport, ApiError } from '@/lib/api';
import TradePicker, { type Trade } from '@/components/worker/TradePicker';
import type { BookingRecord, BookingStatus } from '@/types';

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  confirmed: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  in_progress: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  completed: 'bg-green-500/10 text-green-600 border-green-500/30',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/30',
};

function readOfflineBookings(): BookingRecord[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem('profix-pending-bookings') || '[]');
    return Array.isArray(parsed) ? (parsed as BookingRecord[]) : [];
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [offline, setOffline] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [isWorker, setIsWorker] = useState<boolean | null>(null);
  const [trade, setTrade] = useState<Trade | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (user) setProfile({ name: user.name, phone: user.phone || '' });
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;
    apiWorkerMe(user.email).then(() => setIsWorker(true)).catch(() => setIsWorker(false));
  }, [user?.email]);

  const handleBecomeWorker = async () => {
    if (!trade) {
      toast({ variant: 'destructive', title: 'Pick your trade', description: 'Choose Plumbers or Electricians to switch.' });
      return;
    }
    setSwitching(true);
    try {
      await apiBecomeWorker({ trade, phone: profile.phone.trim() || undefined });
      setIsWorker(true);
      toast({ title: 'You are now a worker!', description: 'Your account was switched — open your worker dashboard to see jobs and earnings.' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not switch', description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setSwitching(false);
    }
  };

  const handleReportFraud = async (b: BookingRecord) => {
    if (!b.workerEmail) return;
    const reason = window.prompt(`Report fraud for the worker on this booking (${b.workerEmail})?\n\nTell us briefly what happened. Reports are reviewed by the ProFix team; accounts with repeated fraud reports are suspended.`);
    if (reason === null) return;
    try {
      const { reportCount } = await submitFraudReport(b.workerEmail, reason);
      toast({ title: 'Report submitted', description: `Thank you — this account now has ${reportCount} fraud report(s) on file.` });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not submit report', description: err instanceof ApiError ? err.message : undefined });
    }
  };

  useEffect(() => {
    setOffline(readOfflineBookings());
    (async () => {
      try {
        setBookings(await fetchMyBookings());
      } catch (err) {
        setApiError(err instanceof ApiError ? err.message : 'Could not load bookings.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name: profile.name.trim(), phone: profile.phone.trim() });
      toast({ title: 'Profile updated' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not update profile', description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      const updated = await cancelBooking(id);
      setBookings((list) => list.map((b) => (b.id === id ? updated : b)));
      toast({ title: 'Booking cancelled' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not cancel', description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setCancelling(null);
    }
  };

  return (
    <section className="section-padding">
      <div className="container-wide">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">My Account</p>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
            Hello, <span className="text-brand-orange">{user?.name.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground mt-2">{user?.email} • {user?.role}</p>
          <div className="flex gap-2 mt-3">
            {user?.status === 'suspended' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1">
                <ShieldAlert className="size-3.5" /> Account suspended · flagged for fraud
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1">
                Account active
              </span>
            )}
            {isWorker && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border border-brand-orange/40 bg-brand-orange/10 text-brand-orange px-3 py-1">
                <HardHat className="size-3.5" /> Worker account
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <form onSubmit={handleSaveProfile} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="size-11 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                  <User className="size-5 text-brand-orange" />
                </div>
                <h2 className="font-display font-bold text-foreground">Profile settings</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pemail">Email (sign-in ID — cannot be changed)</Label>
                  <Input id="pemail" value={user?.email || ''} disabled readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pname">Full Name</Label>
                  <Input id="pname" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pphone">Phone</Label>
                  <Input id="pphone" type="tel" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <Button type="submit" disabled={savingProfile} className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
                  {savingProfile ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>

            {/* Switch customer -> worker (same account, converted) */}
            <div className="bg-card border border-border rounded-2xl p-6 mt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-11 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                  <HardHat className="size-5 text-brand-orange" />
                </div>
                <h2 className="font-display font-bold text-foreground">{isWorker ? 'Your worker account' : 'Become a worker'}</h2>
              </div>
              {isWorker ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    This account is registered as a worker. Your jobs, earnings and worker profile settings live in the worker dashboard.
                  </p>
                  <Button asChild className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
                    <Link to="/worker/dashboard">Open Worker Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Work with ProFix as a plumber or electrician. Your account switches to a worker
                    account (same email — customer and worker accounts are kept separate, so this
                    converts yours instead of registering a duplicate).
                  </p>
                  <div className="space-y-3">
                    <TradePicker value={trade} onChange={setTrade} />
                    <Button onClick={handleBecomeWorker} disabled={switching || !trade} className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
                      {switching ? <Loader2 className="size-4 mr-2 animate-spin" /> : <HardHat className="size-4 mr-2" />}
                      Switch to Worker Account
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="bg-navy text-white rounded-2xl p-6 mt-6">
              <h2 className="font-display font-bold mb-2">Need another service?</h2>
              <p className="text-sm text-white/60 mb-4">Book in two minutes — your details are already saved.</p>
              <Button asChild className="bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
                <Link to="/booking"><CalendarPlus className="size-4 mr-2" /> New Booking</Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-8">
            <h2 className="font-display font-bold text-foreground text-xl mb-4">My Bookings</h2>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="size-8 animate-spin text-brand-orange" />
              </div>
            ) : (
              <>
                {apiError && bookings.length === 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-xl px-4 py-3 text-sm mb-4 flex gap-2">
                    <WifiOff className="size-4 shrink-0 mt-0.5" />
                    <span>{apiError} — we couldn't reach the booking service just now, so bookings saved on this device are shown below. Refresh in a moment to see live statuses.</span>
                  </div>
                )}

                {bookings.length === 0 && offline.length === 0 && !apiError && (
                  <div className="bg-card border border-border rounded-2xl p-10 text-center">
                    <p className="text-4xl mb-3">📅</p>
                    <h3 className="font-display font-bold text-foreground mb-2">No bookings yet</h3>
                    <p className="text-sm text-muted-foreground mb-5">When you book a service it will appear here with live status.</p>
                    <Button asChild className="bg-brand-orange hover:bg-brand-orange-dark text-white">
                      <Link to="/booking">Book Your First Service</Link>
                    </Button>
                  </div>
                )}

                <div className="space-y-4">
                  {[...bookings, ...offline].map((b) => (
                    <article key={b.id} className="bg-card border border-border rounded-2xl p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display font-semibold text-foreground capitalize">
                            {b.serviceType} service{b.serviceSlug ? ` • ${b.serviceSlug.replace(/-/g, ' ')}` : ''}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {[b.date, b.time].filter(Boolean).join(' • ') || 'Date to be confirmed'}
                            {b.urgency !== 'normal' ? ` • ${b.urgency}` : ''}
                          </p>
                          {b.description && <p className="text-sm text-foreground/70 mt-2">{b.description}</p>}
                          <p className="text-xs text-muted-foreground mt-2">
                            Booked {new Date(b.createdAt).toLocaleDateString()} • Ref {b.id.slice(0, 8)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full border text-xs font-semibold capitalize ${STATUS_STYLES[b.status] || ''}`}>
                            {b.status.replace('_', ' ')}
                          </span>
                          {b.offline && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                              <WifiOff className="size-3" /> saved offline
                            </span>
                          )}
                          {!b.offline && b.status !== 'cancelled' && b.status !== 'completed' && (
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={cancelling === b.id}
                              className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
                            >
                              {cancelling === b.id ? <Loader2 className="size-3 animate-spin" /> : <XCircle className="size-3" />}
                              Cancel booking
                            </button>
                          )}
                          {!b.offline && b.workerEmail && (
                            <button
                              onClick={() => handleReportFraud(b)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
                            >
                              <ShieldAlert className="size-3" />
                              Report fraud
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
