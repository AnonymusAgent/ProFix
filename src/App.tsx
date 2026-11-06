import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/hooks/useTheme';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import ScrollToTop from '@/components/layout/ScrollToTop';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';

const Home = lazy(() => import('@/pages/Home'));
const Services = lazy(() => import('@/pages/Services'));
const ServiceDetail = lazy(() => import('@/pages/ServiceDetail'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Booking = lazy(() => import('@/pages/Booking'));
const Testimonials = lazy(() => import('@/pages/Testimonials'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Admin = lazy(() => import('@/pages/Admin'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 border-[3px] border-brand-orange border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              {/* Catch-all — previously unknown URLs rendered a blank page */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster />
        <Analytics />
      </AuthProvider>
    </ThemeProvider>
  );
}
