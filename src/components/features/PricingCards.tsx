import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PRICING_PLANS } from '@/constants/mockData';
import { fetchPricing } from '@/lib/api';
import type { PricingPlan } from '@/types';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function PricingCards() {
  const { ref, isVisible } = useScrollAnimation();
  const [plans, setPlans] = useState<PricingPlan[]>(PRICING_PLANS);

  useEffect(() => {
    let cancelled = false;
    fetchPricing().then((data) => { if (!cancelled && data.length) setPlans(data); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section ref={ref} className="section-padding">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Pricing</p>
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
            Transparent, <span className="text-brand-orange">Fair Pricing</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            No hidden fees. Get a clear quote before work begins. Choose the plan that fits your needs.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className={`relative rounded-2xl p-6 lg:p-8 flex flex-col transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-navy text-white border-2 border-brand-orange shadow-xl shadow-brand-orange/10 scale-[1.02]'
                  : 'bg-card border border-border hover:border-brand-orange/30 hover:shadow-lg'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-orange text-white text-xs font-bold rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-display font-bold text-lg ${plan.highlighted ? 'text-white' : 'text-foreground'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mt-1 ${plan.highlighted ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className={`text-3xl font-display font-bold tabular-nums ${plan.highlighted ? 'text-brand-orange' : 'text-brand-orange'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ml-1 ${plan.highlighted ? 'text-white/50' : 'text-muted-foreground'}`}>
                  /{plan.unit}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check className={`size-4 mt-0.5 shrink-0 ${plan.highlighted ? 'text-brand-orange' : 'text-green-500'}`} />
                    <span className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-muted-foreground'}`}>{feat}</span>
                  </li>
                ))}
              </ul>

              <Button asChild className={`w-full font-display font-semibold ${
                plan.highlighted
                  ? 'bg-brand-orange hover:bg-brand-orange-dark text-white'
                  : 'bg-foreground/5 hover:bg-foreground/10 text-foreground'
              }`}>
                <Link to="/booking">
                  Get Started
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
