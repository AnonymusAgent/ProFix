import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FAQ_DATA } from '@/constants/mockData';
import { fetchFaqs } from '@/lib/api';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import type { FAQItem } from '@/types';

interface FAQAccordionProps {
  items?: FAQItem[];
  showHeader?: boolean;
}

export default function FAQAccordion({ items: itemsProp, showHeader = true }: FAQAccordionProps) {
  const [fetched, setFetched] = useState<FAQItem[]>(FAQ_DATA.slice(0, 6));
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    if (itemsProp) return;
    let cancelled = false;
    fetchFaqs().then((data) => { if (!cancelled && data.length) setFetched(data.slice(0, 6)); });
    return () => { cancelled = true; };
  }, [itemsProp]);

  const items = itemsProp ?? fetched;

  return (
    <section ref={ref} className={showHeader ? 'section-padding' : ''}>
      <div className={showHeader ? 'container-wide' : ''}>
        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">FAQ</p>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              Frequently Asked <span className="text-brand-orange">Questions</span>
            </h2>
          </motion.div>
        )}

        <div className="max-w-3xl mx-auto space-y-3">
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.06 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-accent/50 transition-colors"
                >
                  <span className="font-display font-semibold text-foreground text-sm lg:text-base pr-4">
                    {item.question}
                  </span>
                  <ChevronDown className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
