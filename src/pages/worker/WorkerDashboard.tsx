import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarClock, CheckCircle2, ClipboardList, Droplets, Loader2,
  TrendingUp, Wallet, Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiWorkerMe, type WorkerStats } from '@/lib/api';

const money = (cents: number) =>
  (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: cents % 100 ? 2 : 0 });

const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' });
};

/**
 * Worker dashboard — monthly activity + earnings for the signed-in
 * plumber/electrician. Data comes from /api/workers/me (assigned bookings;
 * workers keep 70% of completed job value). Neon Auth owns the session.
 */
export default function WorkerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<WorkerStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    (async () => {
      try {
        const stats = await apiWorkerMe(user.email);
        if (!cancelled) setData(stats);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error && err.message.includes('404')
              ? 'No worker profile found for this account.'
              : 'Could not load your worker stats. The worker database table may still need to be created (server/db/worker-schema.sql).',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  if (loading) {
    return (
      <section className="section-padding">
        <div className="container-wide flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-brand-orange" />
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="section-padding">
        <div className="container-wide max-w-xl mx-auto text-center">
          <div className="bg-card border border-border rounded-2xl p-8">
            <h1 className="font-display font-bold text-foreground text-xl mb-2">Worker dashboard</h1>
            <p className="text-muted-foreground text-sm mb-6">{error || 'Something went wrong.'}</p>
            <Link to="/worker/register" className="text-brand-orange font-semibold hover:underline">
              Complete your worker sign-up
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const { worker, stats } = data;
  const TradeIcon = worker.trade === 'plumber' ? Droplets : Zap;
  const maxEarned = Math.max(1, ...stats.monthly.map((m) => m.earnedCents));

  const cards = [
    { icon: Wallet, label: 'Earned this month', value: money(stats.earnedThisMonthCents) },
    { icon: TrendingUp, label: 'Earned this year', value: money(stats.earnedThisYearCents) },
    { icon: CheckCircle2, label: 'Completed jobs', value: String(stats.completedJobs) },
    { icon: CalendarClock, label: 'Upcoming jobs', value: String(stats.upcomingJobs) },
  ];

  return (
    <section className="section-padding">
      <div className="container-wide">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center size-12 rounded-xl bg-brand-orange/15 text-brand-orange">
                <TradeIcon className="size-6" />
              </span>
              <div>
                <h1 className="font-display font-bold text-foreground text-2xl leading-tight">
                  {worker.name}
                </h1>
                <p className="text-sm text-muted-foreground capitalize">
                  {worker.trade} · you keep {Math.round(stats.payoutRate * 100)}% of completed job value
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <ClipboardList className="size-4 text-brand-orange" />
              {stats.tradeCompletedThisMonth} {worker.trade === 'plumber' ? 'plumbing' : 'electrical'} jobs
              completed company-wide this month
            </p>
          </div>

          {/* Earnings cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-card border border-border rounded-2xl p-5">
                <span className="flex items-center justify-center size-10 rounded-lg bg-brand-orange/15 text-brand-orange mb-3">
                  <Icon className="size-5" />
                </span>
                <p className="font-display font-bold text-foreground text-2xl leading-none">{value}</p>
                <p className="text-sm text-muted-foreground mt-1.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Monthly activity */}
            <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display font-semibold text-foreground mb-1">Monthly activity</h2>
              <p className="text-sm text-muted-foreground mb-6">Earnings from your completed jobs, last 6 months</p>
              <div className="flex items-end gap-3 h-40">
                {stats.monthly.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-medium text-foreground">{m.earnedCents ? money(m.earnedCents) : '—'}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-brand-orange-dark to-brand-orange min-h-[4px]"
                      style={{ height: `${Math.max(4, (m.earnedCents / maxEarned) * 100)}%` }}
                      title={`${m.jobs} jobs`}
                    />
                    <span className="text-xs text-muted-foreground">{monthLabel(m.month)}</span>
                  </div>
                ))}
              </div>
              {stats.completedJobs === 0 && (
                <p className="text-sm text-muted-foreground mt-6">
                  No completed assigned jobs yet. When the office assigns bookings to{' '}
                  <strong className="text-foreground">{worker.email}</strong> and they&apos;re marked
                  completed, your earnings will appear here automatically.
                </p>
              )}
            </div>

            {/* Recent jobs */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display font-semibold text-foreground mb-4">Recent assigned jobs</h2>
              {stats.recentJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing assigned yet — new assignments will show up here.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {stats.recentJobs.map((job) => (
                    <li key={job.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{job.service}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(job.date).toLocaleDateString()} · <span className="capitalize">{job.status.replace('_', ' ')}</span>
                        </p>
                      </div>
                      {job.earnedCents !== null && (
                        <span className="text-sm font-display font-bold text-green-600 dark:text-green-400">
                          {money(job.earnedCents)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
