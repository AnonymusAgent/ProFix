
import { motion } from 'framer-motion';
import { Shield, Clock, Award, Banknote, HeadphonesIcon, Wrench } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const reasons = [
  {
    icon: Shield,
    title: 'Licensed & Insured',
    description: 'All technicians are fully licensed, bonded, and insured for your complete peace of mind.',
  },
  {
    icon: Clock,
    title: '30-Minute Response',
    description: 'Emergency response within 30 minutes. We know time matters when you have a problem.',
  },
  {
    icon: Award,
    title: '18+ Years Experience',
    description: 'Nearly two decades of combined plumbing and electrical expertise under one roof.',
  },
  {
    icon: Banknote,
    title: 'Transparent Pricing',
    description: 'Upfront quotes with no hidden fees. You approve the price before we start any work.',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Round-the-clock customer support. Emergencies don\'t wait, and neither do we.',
  },
  {
    icon: Wrench,
    title: 'Guaranteed Quality',
    description: 'Every job backed by our satisfaction guarantee and minimum 1-year labor warranty.',
  },
];

export default function WhyChooseUs() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="section-padding">
      <div className="container-wide">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left — header */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Why Choose Us</p>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground text-balance">
                The ProFix{' '}
                <span className="text-brand-orange">Difference</span>
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
                We've built our reputation on reliability, quality craftsmanship, and honest service. Here's why thousands trust ProFix for their homes and businesses.
              </p>
              <div className="mt-8 p-5 rounded-xl bg-brand-orange/5 border border-brand-orange/15">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-display font-bold text-brand-orange tabular-nums">4.9</div>
                  <div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
                    </div>
                    <p className="text-xs text-muted-foreground">Based on 2,400+ reviews</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right — grid */}
          <div className="lg:col-span-8">
            <div className="grid sm:grid-cols-2 gap-5">
              {reasons.map((reason, i) => (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="group p-6 rounded-xl bg-card border border-border hover:border-brand-orange/30 transition-all duration-300 hover:shadow-lg hover:shadow-brand-orange/5"
                >
                  <div className="size-12 rounded-xl bg-brand-orange/10 flex items-center justify-center mb-4 group-hover:bg-brand-orange/20 transition-colors">
                    <reason.icon className="size-6 text-brand-orange" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">{reason.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{reason.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
