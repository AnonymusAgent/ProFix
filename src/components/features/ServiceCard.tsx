import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Wrench, Droplets, Waves, Flame, Bath, AlertTriangle, Construction, Cable, Lightbulb, Wind, BatteryCharging, Smartphone, Zap } from 'lucide-react';
import type { Service } from '@/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench, Droplets, Waves, Flame, Bath, AlertTriangle, Construction, Cable,
  CircuitBoard: Cable, Lightbulb, Wind, BatteryCharging, Smartphone, Zap,
};

interface ServiceCardProps {
  service: Service;
  index: number;
  compact?: boolean;
}

export default function ServiceCard({ service, index, compact = false }: ServiceCardProps) {
  const IconComponent = iconMap[service.icon] || Wrench;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.06, duration: 0.4 }}
        className="group relative bg-card rounded-xl border border-border hover:border-brand-orange/40 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-brand-orange/5"
      >
        <div className="flex items-start gap-4">
          <div className={`shrink-0 size-12 rounded-xl flex items-center justify-center ${
            service.category === 'plumbing'
              ? 'bg-brand-blue/10 text-brand-blue'
              : 'bg-brand-orange/10 text-brand-orange'
          }`}>
            <IconComponent className="size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground text-base">{service.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
            {service.price && (
              <p className="text-sm font-semibold text-brand-orange mt-2 tabular-nums">{service.price}</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="group relative bg-card rounded-2xl border border-border hover:border-brand-orange/40 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand-orange/5 hover:-translate-y-1"
    >
      {/* Image */}
      <Link to={`/services/${service.id}`} className="block relative h-48 overflow-hidden" aria-label={service.title}>
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white ${
          service.category === 'plumbing' ? 'bg-brand-blue' : 'bg-brand-orange'
        }`}>
          {service.category === 'plumbing' ? '🔧 Plumbing' : '⚡ Electrical'}
        </div>
        {service.price && (
          <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-white/90 dark:bg-navy/90 backdrop-blur-sm text-sm font-bold text-brand-orange tabular-nums">
            {service.price}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className={`size-10 rounded-lg flex items-center justify-center ${
            service.category === 'plumbing'
              ? 'bg-brand-blue/10 text-brand-blue'
              : 'bg-brand-orange/10 text-brand-orange'
          }`}>
            <IconComponent className="size-5" />
          </div>
          <h3 className="font-display font-bold text-foreground text-lg">{service.title}</h3>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">{service.description}</p>

        {/* Features */}
        <ul className="grid grid-cols-2 gap-1.5 mb-5">
          {service.features.map((feat) => (
            <li key={feat} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1 bg-brand-orange rounded-full shrink-0" />
              {feat}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-3">
          <Link
            to={`/services/${service.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange hover:text-brand-orange-dark transition-colors group/link"
          >
            View Details
            <ArrowRight className="size-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
          <Link
            to={`/booking?service=${service.id}`}
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-brand-orange/10 text-brand-orange text-sm font-semibold hover:bg-brand-orange hover:text-white transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
