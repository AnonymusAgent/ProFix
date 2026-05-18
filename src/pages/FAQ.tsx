import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FAQAccordion from '@/components/features/FAQAccordion';
import PricingCards from '@/components/features/PricingCards';
import EmergencyBanner from '@/components/features/EmergencyBanner';
import { FAQ_DATA } from '@/constants/mockData';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const categories = ['All', 'General', 'Pricing', 'Emergency', 'Electrical'] as const;

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const { ref, isVisible } = useScrollAnimation();

  const filtered = activeCategory === 'All' ? FAQ_DATA : FAQ_DATA.filter((f) => f.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-[15%] size-60 bg-brand-orange/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-[10%] size-40 bg-brand-blue/5 rounded-full blur-3xl" />
        </div>
        <div className="container-wide relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Help Center</p>
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-white text-balance">
              FAQ & <span className="text-brand-orange">Pricing</span>
            </h1>
            <p className="text-white/60 mt-3 max-w-xl">
              Find answers to common questions and explore our transparent pricing plans.
            </p>
          </motion.div>
        </div>
      </section>

      <PricingCards />

      {/* FAQ with filters */}
      <section ref={ref} className="section-padding bg-muted/30">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-8"
          >
            <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Common Questions</p>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              Frequently Asked <span className="text-brand-orange">Questions</span>
            </h2>
          </motion.div>

          {/* Category filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-brand-orange text-white'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-brand-orange/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <FAQAccordion items={filtered} showHeader={false} />

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="text-center mt-12 p-8 bg-card rounded-2xl border border-border"
          >
            <h3 className="text-xl font-display font-bold text-foreground mb-2">Still Have Questions?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Our team is ready to help. Reach out and we'll get back to you within 2 hours.
            </p>
            <Button asChild className="bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
              <Link to="/contact">
                Contact Us
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <EmergencyBanner />
    </>
  );
}
