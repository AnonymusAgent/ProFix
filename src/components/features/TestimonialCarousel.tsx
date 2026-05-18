import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '@/constants/mockData';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const { ref, isVisible } = useScrollAnimation();
  const visibleCount = 3;
  const maxIndex = Math.max(0, TESTIMONIALS.length - visibleCount);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(maxIndex, c + 1));

  return (
    <section ref={ref} className="section-padding bg-muted/50">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12"
        >
          <div>
            <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Testimonials</p>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground text-balance">
              Trusted by Thousands of{' '}
              <span className="text-brand-orange">Happy Customers</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              disabled={current === 0}
              className="size-11 flex items-center justify-center rounded-xl border border-border hover:bg-accent hover:border-brand-orange/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={next}
              disabled={current >= maxIndex}
              className="size-11 flex items-center justify-center rounded-xl bg-brand-orange text-white hover:bg-brand-orange-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next testimonials"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{ x: `-${current * (100 / visibleCount + 2)}%` }}
            transition={{ type: 'spring', stiffness: 250, damping: 30 }}
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <div className="h-full bg-card rounded-2xl border border-border p-6 lg:p-8 flex flex-col relative">
                  <Quote className="absolute top-6 right-6 size-8 text-brand-orange/10" />

                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={`size-4 ${si < t.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-foreground/80 leading-relaxed flex-1 text-pretty">
                    "{t.text}"
                  </p>

                  <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="size-10 rounded-full object-cover" loading="lazy" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role} • {t.service}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-8 lg:hidden">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-6 bg-brand-orange' : 'w-1.5 bg-border'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
