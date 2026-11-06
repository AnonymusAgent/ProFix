import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import Logo from '@/components/brand/Logo';

/**
 * Admin sign-in.
 *
 * This page is intentionally not linked from the header, footer, or the
 * customer login page — it is only reachable by typing /loginadmin.
 * Admins authenticate against the ProFix API, which signs a JWT with the
 * server-side JWT_SECRET. Customer accounts (Neon Auth) cannot sign in
 * here, and this form cannot sign customers in.
 */
export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { adminLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminLogin(email.trim(), password);
      toast({ title: 'Welcome back, admin.' });
      navigate('/admin', { replace: true });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Admin login failed',
        description: err instanceof ApiError || err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/5">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="size-5 text-brand-orange" />
            <h1 className="font-display font-bold text-foreground text-lg">Admin Console</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Restricted access. Authorised Web Loom LLC operators only.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@your-domain.com"
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full bg-navy hover:bg-navy-light text-white font-display font-semibold"
            >
              {submitting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <ShieldCheck className="size-4 mr-2" />}
              Sign in to Admin
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Web Loom LLC
        </p>
      </div>
    </main>
  );
}
