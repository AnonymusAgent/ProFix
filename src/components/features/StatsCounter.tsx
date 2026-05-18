import { motion } from 'framer-motion';
import { useCounter } from '@/hooks/useCounter';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { STATS } from '@/constants/mockData';

function StatItem({ value, suffix, label, index }: { value: number; suffix: string; label: string; index: number }) {
  const { ref, isVisible } = useScrollAnimation(0.3);
  const count = useCounter(value, 2200, 0, isVisible);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      className="text-center lg:text-left"
    >
      <div className="font-display font-bold text-4xl lg:text-5xl xl:text-6xl text-white tabular-nums">
        {count.toLocaleString()}
        <span className="text-brand-orange">{suffix}</span>
      </div>
      <p className="text-white/50 text-sm lg:text-base mt-2 font-medium">{label}</p>
    </motion.div>
  );
}

export default function StatsCounter() {
  return (
    <section className="relative bg-navy overflow-hidden">
      {/* Geometric background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-10 left-[10%] size-40 border border-white/20 rounded-full" />
          <div className="absolute bottom-10 right-[15%] size-60 border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 border border-white/10 rounded-full" />
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-orange/5 to-transparent" />
      </div>

      <div className="container-wide relative z-10 py-16 lg:py-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {STATS.map((stat, i) => (
            <StatItem key={stat.label} {...stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
