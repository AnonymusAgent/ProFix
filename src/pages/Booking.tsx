import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Shield, Star } from 'lucide-react';
import BookingForm from '@/components/features/BookingForm';

export default function Booking() {
  const [params] = useSearchParams();
  const service = params.get('service') || undefined;

  return (
    <>
      <section className="relative bg-navy py-16 lg:py-20 overflow-hidden">
        <div className="absolute top-10 right-[10%] size-60 bg-brand-orange/5 rounded-full blur-3xl" />
        <div className="container-wide relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Book a Service</p>
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-white text-balance">
              Schedule Your <span className="text-brand-orange">Appointment</span>
            </h1>
            <p className="text-white/60 mt-3 max-w-xl">
              Two minutes to book. We confirm within 30 minutes during business hours — same-day service for most requests.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-4">
            {[
              { icon: Clock, title: '30-minute confirmation', text: 'Our dispatch team reviews every request and confirms your window fast.' },
              { icon: Shield, title: 'Licensed & guaranteed', text: 'Every job is covered by insurance and a minimum 1-year labor warranty.' },
              { icon: Star, title: '4.9★ rated', text: '2,400+ verified reviews from homeowners and businesses across Metro City.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 bg-card border border-border rounded-2xl p-5"
              >
                <div className="size-11 shrink-0 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                  <item.icon className="size-5 text-brand-orange" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-foreground">{item.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{item.text}</p>
                </div>
              </motion.div>
            ))}
            <div className="bg-muted/50 border border-border rounded-2xl p-5">
              <h2 className="font-display font-semibold text-foreground mb-2">What happens next?</h2>
              <ol className="text-sm text-muted-foreground space-y-2 list-none">
                <li><strong className="text-brand-orange">01</strong> — You submit the request</li>
                <li><strong className="text-brand-orange">02</strong> — We call to confirm time & price range</li>
                <li><strong className="text-brand-orange">03</strong> — A licensed tech arrives and fixes it</li>
              </ol>
            </div>
          </div>
          <div className="lg:col-span-7">
            <BookingForm defaultServiceSlug={service} />
          </div>
        </div>
      </section>
    </>
  );
}
