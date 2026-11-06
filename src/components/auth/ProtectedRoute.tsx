import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-10 border-[3px] border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  // Admin routes must bounce to the ADMIN login (/loginadmin), never the
  // customer login: admin credentials entered into the Neon customer form
  // can only ever fail with "Invalid email or password".
  if (adminOnly && !isAdmin) return <Navigate to="/loginadmin" replace />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
