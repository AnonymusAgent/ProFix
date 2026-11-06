import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE_CONFIG } from '@/constants/config';

export default function EmergencyBanner() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-brand-orange" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />

      <div className="container-wide relative z-10 py-10 lg:py-14">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="size-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center"
            >
              <AlertTriangle className="size-7 text-white" />
            </motion.div>
            <div>
              <h3 className="text-xl lg:text-2xl font-display font-bold text-white flex items-center gap-2">
                <Zap className="size-5" />
                Plumbing or Electrical Emergency?
              </h3>
              <p className="text-white/80 text-sm lg:text-base mt-0.5">
                Don't wait — our emergency team responds within 30 minutes, 24/7.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild size="lg" className="h-[52px] px-8 bg-white text-red-600 hover:bg-white/90 font-display font-bold shadow-xl">
              <a href={`tel:${SITE_CONFIG.emergencyPhone}`}>
                <Phone className="size-5 mr-2" />
                {SITE_CONFIG.emergencyPhone}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-[52px] px-6 border-white/30 text-white hover:bg-white/10 font-display font-semibold">
              <Link to="/booking">Book Online</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
