import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/features/HeroSection';
import ServiceCard from '@/components/features/ServiceCard';
import StatsCounter from '@/components/features/StatsCounter';
import WhyChooseUs from '@/components/features/WhyChooseUs';
import TestimonialCarousel from '@/components/features/TestimonialCarousel';
import EmergencyBanner from '@/components/features/EmergencyBanner';
import FAQAccordion from '@/components/features/FAQAccordion';
import BookingForm from '@/components/features/BookingForm';
import { SERVICES } from '@/constants/mockData';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'all' | 'plumbing' | 'electrical'>('all');
  const { ref: servicesRef, isVisible: servicesVisible } = useScrollAnimation();
  const { ref: bookingRef, isVisible: bookingVisible } = useScrollAnimation();

  const filteredServices = SERVICES.filter(
    (s) => activeTab === 'all' || s.category === activeTab
  ).slice(0, 6);

  return (
    <>
      <HeroSection />
      <StatsCounter />

      {/* Services preview */}
      <section ref={servicesRef} className="section-padding">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={servicesVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10"
          >
            <div>
              <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Our Services</p>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground text-balance">
                Professional <span className="text-brand-orange">Services</span> You Can Trust
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
              {([
                { key: 'all', label: 'All Services' },
                { key: 'plumbing', label: '🔧 Plumbing' },
                { key: 'electrical', label: '⚡ Electrical' },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={servicesVisible ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="text-center mt-10"
          >
            <Button asChild variant="outline" size="lg" className="font-display font-semibold">
              <Link to="/services">
                View All Services
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <WhyChooseUs />
      <EmergencyBanner />
      <TestimonialCarousel />

      {/* Booking section */}
      <section ref={bookingRef} className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={bookingVisible ? { opacity: 1, y: 0 } : {}}
              className="lg:col-span-5 flex flex-col justify-center"
            >
              <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Book Now</p>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground text-balance">
                Schedule Your <span className="text-brand-orange">Service</span> Today
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
                Fill out the form and our team will reach out within 30 minutes to confirm your appointment. Same-day service available for most requests.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { step: '01', text: 'Tell us about your issue' },
                  { step: '02', text: 'We confirm and dispatch a tech' },
                  { step: '03', text: 'Problem solved — guaranteed' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4">
                    <span className="size-10 shrink-0 rounded-lg bg-brand-orange/10 flex items-center justify-center text-sm font-display font-bold text-brand-orange tabular-nums">
                      {item.step}
                    </span>
                    <span className="text-foreground font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={bookingVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 }}
              className="lg:col-span-7"
            >
              <BookingForm />
            </motion.div>
          </div>
        </div>
      </section>

      <FAQAccordion />
    </>
  );
}
