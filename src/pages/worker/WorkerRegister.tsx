import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { apiSaveWorkerProfile } from '@/lib/api';
import { friendlyAuthError } from '@/lib/auth-errors';
import Logo from '@/components/brand/Logo';
import TradePicker, { type Trade } from '@/components/worker/TradePicker';

/**
 * Worker sign-up (plumbers & electricians).
 *
 * Accounts are created in Neon Auth (cookie session), then the ProFix
 * worker profile (trade, phone) is saved in the ProFix database. Workers
 * never use the API JWT login — that stays admin-only.
 */
export default function WorkerRegister() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [trade, setTrade] = useState<Trade | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trade) {
      toast({ variant: 'destructive', title: 'Pick your trade', description: 'Choose Plumbers or Electricians to continue.' });
      return;
    }
    if (form.password.length < 8) {
      toast({ variant: 'destructive', title: 'Password too short', description: 'Use at least 8 characters.' });
      return;
    }
    if (form.password !== form.confirm) {
      toast({ variant: 'destructive', title: 'Passwords do not match', description: 'Please re-enter your password.' });
      return;
    }
    setSubmitting(true);
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      await apiSaveWorkerProfile({
        email: user.email,
        name: user.name,
        phone: form.phone.trim() || undefined,
        trade,
        neonUserId: user.id,
      });
      toast({ title: `Welcome aboard, ${user.name.split(' ')[0]}!`, description: 'Your worker account is ready.' });
      navigate('/worker/dashboard', { replace: true });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Worker registration failed',
        description: friendlyAuthError(err),
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
          className="w-full max-w-lg bg-card border border-border rounded-2xl p-8"
        >
          <Logo className="mb-5" />
          <h1 className="font-display font-bold text-foreground text-xl">Join ProFix as a worker</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Create your account, pick your trade, and track your jobs and earnings.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>I work as a…</Label>
              <TradePicker value={trade} onChange={setTrade} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="w-name">Full name</Label>
              <Input id="w-name" value={form.name} onChange={set('name')} placeholder="Sam Carter" required autoComplete="name" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="w-email">Email</Label>
                <Input id="w-email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="w-phone">Phone</Label>
                <Input id="w-phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="(555) 000-1234" autoComplete="tel" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="w-password">Password</Label>
                <Input id="w-password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="w-confirm">Confirm password</Label>
                <Input id="w-confirm" type="password" value={form.confirm} onChange={set('confirm')} placeholder="••••••••" required autoComplete="new-password" />
              </div>
            </div>
            <Button type="submit" size="lg" disabled={submitting} className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
              {submitting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <UserPlus className="size-4 mr-2" />}
              Create worker account
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already a ProFix worker?{' '}
            <Link to="/worker/login" className="text-brand-orange font-semibold hover:underline">Worker login</Link>
          </p>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Worker accounts are secured by Neon Auth.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
