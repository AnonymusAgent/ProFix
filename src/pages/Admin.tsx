import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Users, Mail, Wrench, Loader2, Search, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  fetchAdminStats, fetchAdminBookings, updateBooking, fetchAdminMessages,
  markMessageRead, fetchAdminUsers, updateUserRole, fetchHealth, fetchAdminWorkers, ApiError,
  type WorkerProfile,
} from '@/lib/api';
import type { AdminStats, AuthUser, BookingRecord, ContactMessageRecord } from '@/types';

const STATUS_OPTIONS = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;

type Tab = 'bookings' | 'messages' | 'users';

export default function Admin() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('bookings');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
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
        // Workers power the Assign dropdown; never block the panel on them.
        fetchAdminWorkers().then(setWorkers).catch(() => setWorkers([]));
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

  const selectClass = 'h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <section className="section-padding">
      <div className="container-wide">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Admin</p>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
            ProFix <span className="text-brand-orange">Control Panel</span>
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
            <Database className="size-4" /> Database (Neon/PostgreSQL): <strong className="text-foreground">{dbStatus}</strong>
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-brand-orange" /></div>
        ) : error ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">🗄️</p>
            <h2 className="font-display font-bold text-foreground mb-2">Admin data unavailable</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">{error}</p>
            <p className="text-xs text-muted-foreground mt-3">
              If this says the database is not configured, connect Neon via <code className="font-mono">DATABASE_URL</code> and run{' '}
              <code className="font-mono">npm run db:setup</code> — full steps are in the README.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: CalendarCheck, label: 'Total Bookings', value: stats?.totalBookings ?? 0 },
                { icon: Mail, label: 'Unread Messages', value: stats?.unreadMessages ?? 0 },
                { icon: Users, label: 'Registered Users', value: stats?.totalUsers ?? 0 },
                { icon: Wrench, label: 'Active Services', value: stats?.activeServices ?? 0 },
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

            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit mb-6">
              {(['bookings', 'messages', 'users'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t} {t === 'messages' && stats ? `(${stats.unreadMessages} new)` : ''}
                </button>
              ))}
            </div>

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
              <div className="bg-card border border-border rounded-2xl overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-border/60 last:border-0">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.phone || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3">
                          <select value={u.role} onChange={(e) => handleRole(u.id, e.target.value as AuthUser['role'])} className={selectClass} aria-label={`Role for ${u.name}`}>
                            <option value="customer">customer</option>
                            <option value="technician">technician</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
