import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HardHat, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { apiSaveWorkerProfile, apiWorkerMe } from '@/lib/api';
import { friendlyAuthError } from '@/lib/auth-errors';
import Logo from '@/components/brand/Logo';
import TradePicker, { type Trade } from '@/components/worker/TradePicker';

/**
 * Worker login (plumbers & electricians) — Neon Auth only.
 *
 * After the Neon sign-in, the worker profile is loaded from the ProFix
 * API. Accounts that signed up as customers but have no worker profile
 * yet can complete it here by picking their trade.
 */
export default function WorkerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [needsTrade, setNeedsTrade] = useState<null | { name: string; email: string; id: string }>(null);
  const [trade, setTrade] = useState<Trade | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      try {
        await apiWorkerMe(user.email);
        toast({ title: `Welcome back, ${user.name.split(' ')[0]}!` });
        navigate('/worker/dashboard', { replace: true });
      } catch {
        // Signed in via Neon but no worker profile yet — let them finish it.
        setNeedsTrade({ name: user.name, email: user.email, id: user.id });
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Worker login failed',
        description: friendlyAuthError(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const completeProfile = async () => {
    if (!needsTrade || !trade) return;
    setSubmitting(true);
    try {
      await apiSaveWorkerProfile({
        email: needsTrade.email,
        name: needsTrade.name,
        trade,
        neonUserId: needsTrade.id,
      });
      toast({ title: 'Worker profile created', description: 'Welcome to your dashboard.' });
      navigate('/worker/dashboard', { replace: true });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not save your trade',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-padding">
      <div className="container-wide flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card border border-border rounded-2xl p-8"
        >
          <Logo className="mb-5" />
          <div className="flex items-center gap-2">
            <HardHat className="size-5 text-brand-orange" />
            <h1 className="font-display font-bold text-foreground text-xl">Worker login</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            For ProFix plumbers &amp; electricians. Track jobs and earnings.
          </p>

          {!needsTrade ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="worker-email">Email</Label>
                <Input id="worker-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="worker-password">Password</Label>
                <Input id="worker-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
              </div>
              <Button type="submit" size="lg" disabled={submitting} className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
                {submitting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <LogIn className="size-4 mr-2" />}
                Log in
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-foreground">
                You&apos;re signed in as <strong>{needsTrade.email}</strong>, but there&apos;s no worker
                profile yet. Pick your trade to finish:
              </p>
              <TradePicker value={trade} onChange={setTrade} />
              <Button size="lg" disabled={!trade || submitting} onClick={completeProfile} className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
                {submitting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <HardHat className="size-4 mr-2" />}
                Continue to my dashboard
              </Button>
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center mt-6">
            New to ProFix?{' '}
            <Link to="/worker/register" className="text-brand-orange font-semibold hover:underline">Worker sign-up</Link>
          </p>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Worker accounts are secured by Neon Auth.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
