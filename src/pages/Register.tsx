import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Loader2 } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const user = await register({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || undefined, password: form.password });
      toast({ title: `Account created — welcome, ${user.name.split(' ')[0]}!` });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
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
          <div className="mb-6">
            <Logo className="mb-5" />
            <h1 className="font-display font-bold text-foreground text-xl leading-none">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-2">Book services, track visits and leave reviews</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={form.name} onChange={set('name')} placeholder="John Smith" required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="(555) 123-4567" autoComplete="tel" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={form.password} onChange={set('password')} placeholder="8+ characters" required autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm</Label>
                <Input id="confirm" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat it" required autoComplete="new-password" />
              </div>
            </div>
            <Button type="submit" size="lg" disabled={submitting} className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
              {submitting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <UserPlus className="size-4 mr-2" />}
              Create Account
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-orange font-semibold hover:underline">Log in</Link>
          </p>
          <p className="text-xs text-muted-foreground text-center mt-3">
            By creating an account you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
