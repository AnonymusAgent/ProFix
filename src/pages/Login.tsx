import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Loader2 } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      toast({ title: `Welcome back, ${user.name.split(' ')[0]}!` });
      navigate(from, { replace: true });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
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
            <h1 className="font-display font-bold text-foreground text-xl leading-none">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-2">Log in to track bookings &amp; reviews</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
            </div>
            <Button type="submit" size="lg" disabled={submitting} className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
              {submitting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <LogIn className="size-4 mr-2" />}
              Log In
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            New to ProFix?{' '}
            <Link to="/register" className="text-brand-orange font-semibold hover:underline">Create an account</Link>
          </p>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Customer accounts are secured by Neon Auth.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
