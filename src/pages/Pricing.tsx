import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PricingCards from '@/components/features/PricingCards';
import FAQAccordion from '@/components/features/FAQAccordion';
import EmergencyBanner from '@/components/features/EmergencyBanner';

export default function Pricing() {
  return (
    <>
      <section className="relative bg-navy py-16 lg:py-20 overflow-hidden">
        <div className="absolute top-10 left-[15%] size-60 bg-brand-orange/5 rounded-full blur-3xl" />
        <div className="container-wide relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Pricing</p>
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-white text-balance">
              Transparent, <span className="text-brand-orange">Fair Pricing</span>
            </h1>
            <p className="text-white/60 mt-3 max-w-xl">
              No hidden fees and no surprises. You approve a written quote before any work begins.
            </p>
          </motion.div>
        </div>
      </section>

      <PricingCards />

      <section className="pb-20">
        <div className="container-wide">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BadgeCheck, title: 'Quote Before Work', text: 'Every job starts with a written, itemised estimate. The price you approve is the price you pay.' },
              { icon: Shield, title: 'Warranty Included', text: 'Minimum 1-year labor warranty on standard work, 2 years on premium projects. Parts covered by manufacturer warranty.' },
              { icon: Clock, title: 'No Emergency Surprises', text: 'Emergency call-out rates are quoted on the phone before we dispatch — even at 3 AM.' },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="size-11 rounded-xl bg-brand-orange/10 flex items-center justify-center mb-4">
                  <c.icon className="size-5 text-brand-orange" />
                </div>
                <h2 className="font-display font-semibold text-foreground">{c.title}</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{c.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
              <Link to="/booking">
                Get My Free Estimate
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-3">Diagnostic fee waived when you proceed with the repair.</p>
          </div>
        </div>
      </section>

      <FAQAccordion />
      <EmergencyBanner />
    </>
  );
}
