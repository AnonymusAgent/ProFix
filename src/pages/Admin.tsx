import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarCheck, Users, Mail, Wrench, Loader2, Search, Database,
  LayoutDashboard, LogOut, Globe, ShieldAlert, Ban, Trash2, Undo2, CircleDollarSign, UserCheck, HardHat,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/brand/Logo';
import {
  fetchAdminStats, fetchAdminBookings, updateBooking, fetchAdminMessages,
  markMessageRead, fetchAdminUsers, updateUserRole, fetchHealth, fetchAdminWorkers,
  fetchAdminAnalytics, setUserStatus, deleteAdminUser, ApiError,
  type WorkerProfile, type AdminUser, type AdminAnalytics,
} from '@/lib/api';
import type { AdminStats, AuthUser, BookingRecord, ContactMessageRecord } from '@/types';

const STATUS_OPTIONS = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;

type Tab = 'overview' | 'bookings' | 'messages' | 'users';

const money = (cents: number) =>
  (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: cents % 100 ? 2 : 0 });

const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' });
};

/**
 * Admin console — deliberately its OWN shell: no customer header/footer,
 * no "Book a service" CTAs. Sections: Overview (analytics), Bookings,
 * Messages, Users (roles, fraud reports, suspend/reinstate, delete).
 */
export default function Admin() {
  const { toast } = useToast();
  const { user: adminUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [dbStatus, setDbStatus] = useState<string>('…');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadBookings = useCallback(async () => {
    setBookings(await fetchAdminBookings({ status: statusFilter || undefined, q: search || undefined }));
  }, [statusFilter, search]);

  useEffect(() => {
    (async () => {
      try {
        const [s, b, m, u, h] = await Promise.all([
          fetchAdminStats(), fetchAdminBookings(), fetchAdminMessages(), fetchAdminUsers(),
          fetchHealth().catch(() => ({ db: 'unreachable', status: 'error' })),
        ]);
        // Workers + analytics power pickers/charts; never block the panel on them.
        fetchAdminWorkers().then(setWorkers).catch(() => setWorkers([]));
        fetchAdminAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
        setStats(s);
        setBookings(b);
        setMessages(m);
        setUsers(u);
        setDbStatus(h.db);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not load admin data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loading) loadBookings().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleLogout = async () => {
    await logout();
    navigate('/loginadmin', { replace: true });
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updated = await updateBooking(id, { status });
      setBookings((list) => list.map((b) => (b.id === id ? updated : b)));
      toast({ title: 'Booking updated', description: `Status set to ${status.replace('_', ' ')}.` });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Update failed', description: err instanceof ApiError ? err.message : undefined });
    }
  };

  const handleAssignWorker = async (id: string, workerEmail: string) => {
    try {
      const updated = await updateBooking(id, { workerEmail });
      setBookings((list) => list.map((b) => (b.id === id ? updated : b)));
      const worker = workers.find((w) => w.email === workerEmail);
      toast({
        title: workerEmail ? 'Worker assigned' : 'Worker unassigned',
        description: workerEmail
          ? `${worker?.name || workerEmail} will see this job in their dashboard.`
          : 'This booking is back in the unassigned pool.',
      });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Assignment failed', description: err instanceof ApiError ? err.message : undefined });
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markMessageRead(id);
      setMessages((list) => list.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    } catch {
      toast({ variant: 'destructive', title: 'Could not mark as read' });
    }
  };

  const handleRole = async (id: string, role: AuthUser['role']) => {
    try {
      await updateUserRole(id, role);
      setUsers((list) => list.map((u) => (u.id === id ? { ...u, role } : u)));
      toast({ title: 'Role updated' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Role update failed', description: err instanceof ApiError ? err.message : undefined });
    }
  };

  const handleSuspendToggle = async (u: AdminUser) => {
    const suspending = u.status !== 'suspended';
    const reason = suspending
      ? window.prompt(
          `Suspend ${u.name} (${u.email})?\n\nThey will be signed out everywhere and their profile will show a fraud suspension. ${u.reportCount} fraud report(s) are on file.${u.reportCount > 3 ? ' This account is over the 3-report threshold.' : ''}\n\nReason (shown to support):`,
          u.reportCount > 3 ? 'Suspended after repeated fraud reports' : 'Suspended by admin',
        )
      : undefined;
    if (suspending && reason === null) return;
    try {
      const updated = await setUserStatus(u.id, suspending ? 'suspended' : 'active', reason || undefined);
      setUsers((list) => list.map((x) => (x.id === u.id ? updated : x)));
      toast({
        title: suspending ? 'Account suspended' : 'Account reinstated',
        description: suspending ? `${u.name} can no longer sign in or use the app.` : `${u.name} can sign in again.`,
      });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Status change failed', description: err instanceof ApiError ? err.message : undefined });
    }
  };

  const handleDelete = async (u: AdminUser) => {
    if (!window.confirm(`Permanently delete the account for ${u.name} (${u.email})?\n\nThis removes the user${u.isWorker ? ' and their worker profile' : ''}. This cannot be undone.`)) return;
    try {
      await deleteAdminUser(u.id);
      setUsers((list) => list.filter((x) => x.id !== u.id));
      toast({ title: 'Account deleted', description: `${u.email} has been removed.` });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Delete failed', description: err instanceof ApiError ? err.message : undefined });
    }
  };

  const selectClass = 'h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
  const maxMonthBookings = Math.max(1, ...(analytics?.monthly.map((m) => m.bookings) ?? [1]));

  return (
    <div className="min-h-screen bg-background">
      {/* Admin-only shell header — no storefront navigation, no booking CTAs */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="container-wide flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-brand-orange/15 text-brand-orange px-3 py-1 text-xs font-display font-bold uppercase tracking-wide">
              <LayoutDashboard className="size-3.5" /> Admin Console
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
              <Database className="size-3.5" /> Neon: <strong className="text-foreground">{dbStatus}</strong>
            </span>
            <Button asChild variant="outline" size="sm">
              <Link to="/"><Globe className="size-4 mr-1.5" /> View site</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="size-4 mr-1.5" /> Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="container-wide py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Control Panel</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Signed in as {adminUser?.email}. Manage bookings, customers, workers and account safety — this area is not part of the customer website.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-brand-orange" /></div>
        ) : error ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">🗄️</p>
            <h2 className="font-display font-bold text-foreground mb-2">Admin data unavailable</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">{error}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit mb-6 flex-wrap">
              {(['overview', 'bookings', 'messages', 'users'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t === 'users' ? 'Users & Workers' : t} {t === 'messages' && stats ? `(${stats.unreadMessages} new)` : ''}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: CalendarCheck, label: 'Total bookings', value: stats?.totalBookings ?? 0 },
                    { icon: CircleDollarSign, label: 'Revenue (completed)', value: money(analytics?.revenueCents ?? 0) },
                    { icon: UserCheck, label: 'Completion rate', value: `${analytics?.completionRate ?? 0}%` },
                    { icon: Mail, label: 'Unread messages', value: stats?.unreadMessages ?? 0 },
                    { icon: Users, label: 'Customers', value: analytics?.totalCustomers ?? 0 },
                    { icon: HardHat, label: 'Workers', value: analytics?.totalWorkers ?? 0 },
                    { icon: ShieldAlert, label: 'Fraud reports', value: analytics?.fraudReports ?? 0 },
                    { icon: Ban, label: 'Suspended accounts', value: analytics?.suspendedAccounts ?? 0 },
                  ].map((c) => (
                    <div key={c.label} className="bg-card border border-border rounded-2xl p-5">
                      <div className="size-10 rounded-xl bg-brand-orange/10 flex items-center justify-center mb-3">
                        <c.icon className="size-5 text-brand-orange" />
                      </div>
                      <p className="text-2xl font-display font-bold text-foreground tabular-nums">{c.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6">
                    <h2 className="font-display font-semibold text-foreground mb-1">Web &amp; booking analytics</h2>
                    <p className="text-sm text-muted-foreground mb-6">Bookings per month, last 6 months (site traffic analytics run in Vercel Analytics)</p>
                    <div className="flex items-end gap-3 h-40">
                      {(analytics?.monthly ?? []).map((m) => (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                          <span className="text-xs font-medium text-foreground">{m.bookings || '—'}</span>
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-brand-orange-dark to-brand-orange min-h-[4px]"
                            style={{ height: `${Math.max(4, (m.bookings / maxMonthBookings) * 100)}%` }}
                            title={`${m.bookings} bookings · ${money(m.revenueCents)} revenue · ${m.signups} signups`}
                          />
                          <span className="text-xs text-muted-foreground">{monthLabel(m.month)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-6 text-center">
                      {(analytics?.monthly ?? []).slice(-3).map((m) => (
                        <div key={m.month} className="rounded-xl bg-muted/60 px-3 py-2">
                          <p className="text-xs text-muted-foreground">{monthLabel(m.month)} revenue · signups</p>
                          <p className="text-sm font-display font-bold text-foreground">{money(m.revenueCents)} · {m.signups}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h2 className="font-display font-semibold text-foreground mb-4">Bookings by status</h2>
                      <ul className="space-y-2">
                        {STATUS_OPTIONS.map((s) => (
                          <li key={s} className="flex items-center justify-between text-sm">
                            <span className="capitalize text-muted-foreground">{s.replace('_', ' ')}</span>
                            <strong className="text-foreground tabular-nums">{stats?.bookingsByStatus[s] ?? 0}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h2 className="font-display font-semibold text-foreground mb-4">Top services</h2>
                      {analytics?.topServices.length ? (
                        <ul className="space-y-2">
                          {analytics.topServices.map((s) => (
                            <li key={s.title} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{s.title}</span>
                              <strong className="text-foreground tabular-nums">{s.count}</strong>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No bookings yet.</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
                        <Wrench className="size-3.5" /> {stats?.activeServices ?? 0} active services · {workers.length} registered workers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'bookings' && (
              <div>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass} aria-label="Filter by status">
                    <option value="">All statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadBookings()}
                      placeholder="Search name, phone, email…"
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" onClick={() => loadBookings()}>Search</Button>
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-x-auto">
                  <table className="w-full text-sm min-w-[760px]">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Service</th>
                        <th className="px-4 py-3 font-medium">When</th>
                        <th className="px-4 py-3 font-medium">Urgency</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Assigned to</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-b border-border/60 last:border-0">
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">{b.name}</p>
                            <p className="text-xs text-muted-foreground">{b.phone}{b.email ? ` • ${b.email}` : ''}</p>
                          </td>
                          <td className="px-4 py-3 capitalize">{(b.serviceSlug || b.serviceType).replace(/-/g, ' ')}</td>
                          <td className="px-4 py-3 text-muted-foreground">{b.date || '—'} {b.time || ''}</td>
                          <td className="px-4 py-3 capitalize">{b.urgency}</td>
                          <td className="px-4 py-3">
                            <select
                              value={b.status}
                              onChange={(e) => handleStatusChange(b.id, e.target.value)}
                              className={selectClass}
                              aria-label={`Status for booking by ${b.name}`}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={b.workerEmail || ''}
                              onChange={(e) => handleAssignWorker(b.id, e.target.value)}
                              className={selectClass}
                              aria-label={`Assign worker for booking by ${b.name}`}
                            >
                              <option value="">Unassigned</option>
                              {workers.map((w) => (
                                <option key={w.email} value={w.email}>
                                  {w.name} ({w.trade === 'plumber' ? 'Plumber' : 'Electrician'})
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No bookings match.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'messages' && (
              <div className="space-y-3">
                {messages.map((m) => (
                  <article key={m.id} className={`bg-card border rounded-2xl p-5 ${m.isRead ? 'border-border' : 'border-brand-orange/40'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display font-semibold text-foreground">{m.subject || 'General inquiry'}</h3>
                        <p className="text-xs text-muted-foreground">{m.name} • {m.email}{m.phone ? ` • ${m.phone}` : ''} • {new Date(m.createdAt).toLocaleString()}</p>
                        <p className="text-sm text-foreground/80 mt-2">{m.message}</p>
                      </div>
                      {!m.isRead && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkRead(m.id)}>Mark read</Button>
                      )}
                    </div>
                  </article>
                ))}
                {messages.length === 0 && <p className="text-muted-foreground text-sm">Inbox zero. No messages yet.</p>}
              </div>
            )}

            {tab === 'users' && (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Suspend or delete customer and worker accounts. Accounts with <strong className="text-foreground">more than 3 fraud reports</strong> are
                  highlighted for suspension. The legacy <code className="font-mono text-xs">admin@profixservices.com</code> account can be removed with Delete.
                </p>
                <div className="bg-card border border-border rounded-2xl overflow-x-auto">
                  <table className="w-full text-sm min-w-[860px]">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Account</th>
                        <th className="px-4 py-3 font-medium">Phone</th>
                        <th className="px-4 py-3 font-medium">Fraud reports</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className={`border-b border-border/60 last:border-0 ${u.reportCount > 3 && u.status !== 'suspended' ? 'bg-red-500/5' : ''} ${u.status === 'suspended' ? 'bg-red-500/10' : ''}`}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                            <div className="flex gap-1.5 mt-1.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wide rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                                {u.role === 'admin' ? 'Admin' : u.isWorker ? 'Worker' : 'Customer'}
                              </span>
                              {u.status === 'suspended' && (
                                <span className="text-[10px] font-semibold uppercase tracking-wide rounded-full border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5">
                                  Suspended · Fraud
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{u.phone || '—'}</td>
                          <td className="px-4 py-3">
                            {u.reportCount > 0 ? (
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold ${u.reportCount > 3 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                <ShieldAlert className="size-3.5" /> {u.reportCount}{u.reportCount > 3 ? ' — over threshold' : ''}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3 capitalize">{u.status}</td>
                          <td className="px-4 py-3">
                            <select value={u.role} onChange={(e) => handleRole(u.id, e.target.value as AuthUser['role'])} className={selectClass} aria-label={`Role for ${u.name}`}>
                              <option value="customer">customer</option>
                              <option value="technician">technician</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              {u.role !== 'admin' && (
                                <Button
                                  size="sm"
                                  variant={u.status === 'suspended' ? 'outline' : 'destructive'}
                                  onClick={() => handleSuspendToggle(u)}
                                >
                                  {u.status === 'suspended'
                                    ? <><Undo2 className="size-3.5 mr-1" /> Reinstate</>
                                    : <><Ban className="size-3.5 mr-1" /> Suspend</>}
                                </Button>
                              )}
                              {u.id !== adminUser?.id && (
                                <Button size="sm" variant="outline" onClick={() => handleDelete(u)} aria-label={`Delete ${u.name}`}>
                                  <Trash2 className="size-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No accounts yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
