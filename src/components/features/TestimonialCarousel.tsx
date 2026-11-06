import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '@/constants/mockData';
import { fetchTestimonials } from '@/lib/api';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import type { Testimonial } from '@/types';

function useVisibleCount() {
  const [count, setCount] = useState(3);
  useEffect(() => {
    const update = () => setCount(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return count;
}

export default function TestimonialCarousel() {
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<Testimonial[]>(TESTIMONIALS);
  const { ref, isVisible } = useScrollAnimation();
  const visibleCount = useVisibleCount();

  useEffect(() => {
    let cancelled = false;
    fetchTestimonials().then((data) => {
      if (!cancelled && data.length) setItems(data);
    });
    return () => { cancelled = true; };
  }, []);

  // Page-based slicing — the previous transform math (`100/3 + 2 %`)
  // misaligned cards on every breakpoint except desktop.
  const pageCount = Math.max(1, Math.ceil(items.length / visibleCount));
  const safePage = Math.min(page, pageCount - 1);
  const visible = items.slice(safePage * visibleCount, safePage * visibleCount + visibleCount);

  return (
    <section ref={ref} className="section-padding bg-muted/50">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12"
        >
          <div>
            <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Testimonials</p>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground text-balance">
              Trusted by Thousands of <span className="text-brand-orange">Happy Customers</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="size-11 flex items-center justify-center rounded-xl border border-border hover:bg-accent hover:border-brand-orange/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              className="size-11 flex items-center justify-center rounded-xl bg-brand-orange text-white hover:bg-brand-orange-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next testimonials"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-live="polite">
          {visible.map((t, i) => (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="h-full bg-card rounded-2xl border border-border p-6 lg:p-8 flex flex-col relative"
            >
              <Quote className="absolute top-6 right-6 size-8 text-brand-orange/10" />
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} className={`size-4 ${si < t.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed flex-1 text-pretty">"{t.text}"</p>
              <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} className="size-10 rounded-full object-cover" loading="lazy" />
                ) : (
                  <span className="size-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-display font-bold">
                    {t.name.charAt(0)}
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} • {t.service}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-1.5 rounded-full transition-all ${i === safePage ? 'w-6 bg-brand-orange' : 'w-1.5 bg-border'}`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
