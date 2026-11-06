import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Shield, Clock, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE_CONFIG } from '@/constants/config';
import heroBg from '@/assets/hero-bg.jpg';

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] lg:min-h-[88vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-navy/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
      </div>

      {/* Geometric accents */}
      <div className="absolute top-20 right-[10%] size-72 bg-brand-orange/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-[5%] size-48 bg-brand-blue/10 rounded-full blur-3xl" />

      {/* Diagonal accent line */}
      <div className="absolute top-0 right-0 w-1/3 h-full hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-l from-brand-orange/8 to-transparent" style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' }} />
      </div>

      <div className="container-wide relative z-10 py-20 lg:py-0">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Content — left 7 cols */}
          <div className="lg:col-span-7">
            {/* Emergency badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange/15 border border-brand-orange/30 backdrop-blur-sm mb-6"
            >
              <span className="size-2 bg-green-400 rounded-full animate-pulse-glow" />
              <span className="text-sm font-medium text-brand-orange">Available 24/7 — Emergency Response in 30 Minutes</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-white leading-[1.1] text-balance"
            >
              Expert Plumbing{' '}
              <span className="relative">
                <span className="text-brand-orange">&</span>
              </span>{' '}
              Electrical{' '}
              <span className="relative inline-block">
                <span className="text-gradient bg-gradient-to-r from-brand-orange to-yellow-400 bg-clip-text text-transparent">Solutions</span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-6 text-lg lg:text-xl text-white/70 max-w-xl text-pretty leading-relaxed"
            >
              Licensed professionals delivering reliable plumbing and electrical services for homes and businesses. Fast response, fair pricing, guaranteed satisfaction.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Button asChild size="lg" className="h-[52px] px-8 bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold text-base shadow-xl shadow-brand-orange/30">
                <Link to="/booking">
                  Book a Service
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-[52px] px-8 border-white/25 text-white hover:bg-white/10 font-display font-semibold text-base backdrop-blur-sm">
                <a href={`tel:${SITE_CONFIG.emergencyPhone}`}>
                  <Phone className="mr-2 size-5" />
                  Emergency Call
                </a>
              </Button>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mt-10 flex flex-wrap items-center gap-6 lg:gap-8"
            >
              {[
                { icon: Shield, label: 'Licensed & Insured' },
                { icon: Clock, label: '30-Min Response' },
                { icon: Star, label: '4.9★ Rating' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-white/60">
                  <Icon className="size-4 text-brand-orange" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right side — floating card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="hidden lg:block lg:col-span-5"
          >
            <div className="relative">
              <div className="glass-card rounded-2xl p-8 border-white/10 bg-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-12 rounded-xl bg-brand-orange/20 flex items-center justify-center">
                    <Zap className="size-6 text-brand-orange" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg">Quick Service Request</h3>
                    <p className="text-sm text-white/50">Get help within minutes</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { emoji: '🔧', label: 'Plumbing Repair', time: 'Available now' },
                    { emoji: '⚡', label: 'Electrical Fix', time: 'Available now' },
                    { emoji: '🚨', label: 'Emergency Service', time: '24/7 response' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to="/contact"
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-orange/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.emoji}</span>
                        <div>
                          <p className="font-medium text-white text-sm">{item.label}</p>
                          <p className="text-xs text-white/40">{item.time}</p>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-white/30 group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Floating accent */}
              <div className="absolute -bottom-4 -left-4 px-4 py-2 bg-green-500 text-white text-sm font-display font-bold rounded-lg shadow-lg animate-float">
                ✓ 15,000+ Jobs Done
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
