import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Sun, Moon, Zap, Droplets, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE_CONFIG, NAV_LINKS } from '@/constants/config';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Top utility bar */}
      <div className="hidden lg:block bg-navy text-white/90 text-sm">
        <div className="container-wide flex items-center justify-between py-2">
          <div className="flex items-center gap-6">
            <a href={`tel:${SITE_CONFIG.phone}`} className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
              <Phone className="size-3.5" />
              {SITE_CONFIG.phone}
            </a>
            <span className="text-white/30">|</span>
            <span className="text-white/70">{SITE_CONFIG.hours.weekdays}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-brand-orange font-medium animate-pulse-glow">
              <Zap className="size-3.5" />
              24/7 Emergency: {SITE_CONFIG.emergencyPhone}
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20'
            : 'bg-background/80 backdrop-blur-md'
        }`}
      >
        <div className="container-wide flex items-center justify-between h-16 lg:h-[72px]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center size-10 rounded-lg bg-gradient-to-br from-brand-orange to-brand-orange-dark shadow-lg shadow-brand-orange/25">
              <Droplets className="size-5 text-white" />
              <Zap className="absolute -right-1 -top-1 size-3.5 text-brand-orange bg-white rounded-full p-0.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-bold text-foreground leading-none">
                Pro<span className="text-brand-orange">Fix</span>
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none mt-0.5">
                Services
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.path === '/services' && location.pathname.startsWith('/services/'));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? 'text-brand-orange' : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-orange rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="size-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
            </button>
            {user ? (
              <>
                <Button asChild variant="ghost" size="default" className="font-semibold">
                  <Link to="/dashboard">
                    <LayoutDashboard className="size-4 mr-2" />
                    {user.name.split(' ')[0]}
                  </Link>
                </Button>
                {isAdmin && (
                  <Button asChild variant="ghost" size="default" className="font-semibold text-brand-orange">
                    <Link to="/admin">
                      <ShieldCheck className="size-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
                <button
                  onClick={handleLogout}
                  className="size-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut className="size-[18px]" />
                </button>
              </>
            ) : (
              <Button asChild variant="ghost" size="default" className="font-semibold">
                <Link to="/login">Log In</Link>
              </Button>
            )}
            <Button asChild size="default" className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold shadow-lg shadow-brand-orange/25 ml-1">
              <Link to="/booking">
                <Phone className="size-4 mr-2" />
                Book Now
              </Link>
            </Button>
          </div>

          {/* Mobile actions */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="size-10 flex items-center justify-center rounded-lg text-muted-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="size-10 flex items-center justify-center rounded-lg text-foreground"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-[60] bg-background/95 backdrop-blur-xl border-b border-border lg:hidden"
          >
            <nav className="container-wide py-6 flex flex-col gap-1" aria-label="Mobile">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive ? 'bg-brand-orange/10 text-brand-orange' : 'text-foreground/70 hover:bg-accent'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
                {user ? (
                  <>
                    <Link to="/dashboard" className="px-4 py-2 text-sm font-medium text-foreground flex items-center gap-2">
                      <LayoutDashboard className="size-4" /> My Dashboard
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="px-4 py-2 text-sm font-medium text-brand-orange flex items-center gap-2">
                        <ShieldCheck className="size-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-muted-foreground flex items-center gap-2 text-left">
                      <LogOut className="size-4" /> Log Out ({user.email})
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-foreground">
                    Log In / Create Account
                  </Link>
                )}
                <a href={`tel:${SITE_CONFIG.emergencyPhone}`} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-orange font-medium">
                  <Zap className="size-4" />
                  Emergency: {SITE_CONFIG.emergencyPhone}
                </a>
                <Button asChild className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold">
                  <Link to="/booking">
                    <Phone className="size-4 mr-2" />
                    Book Appointment
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
