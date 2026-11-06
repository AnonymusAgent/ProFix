import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Phone, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ServiceCard from '@/components/features/ServiceCard';
import EmergencyBanner from '@/components/features/EmergencyBanner';
import { fetchService, fetchServices, fetchTestimonials } from '@/lib/api';
import { SITE_CONFIG } from '@/constants/config';
import type { Service, Testimonial } from '@/types';

export default function ServiceDetail() {
  const { slug = '' } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [related, setRelated] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const svc = await fetchService(slug);
      if (cancelled) return;
      if (!svc) {
        setMissing(true);
        setLoading(false);
        return;
      }
      setService(svc);
      const [all, tst] = await Promise.all([fetchServices({ category: svc.category }), fetchTestimonials()]);
      if (cancelled) return;
      setRelated(all.filter((s) => s.id !== svc.id).slice(0, 3));
      setReviews(tst.filter((t) => !t.service || t.service.toLowerCase().includes(svc.category)).slice(0, 3));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const priceNote = useMemo(() => service?.price || 'Custom quote', [service]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="size-10 border-[3px] border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (missing || !service) {
    return (
      <section className="section-padding">
        <div className="container-wide text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">Service not found</h1>
          <p className="text-muted-foreground mb-8">That service may have been retired. Browse everything we offer instead.</p>
          <Button asChild className="bg-brand-orange hover:bg-brand-orange-dark text-white">
            <Link to="/services">View All Services</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative h-72 lg:h-96 flex items-end overflow-hidden">
        <div className="absolute inset-0">
          {service.image && <img src={service.image} alt="" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-navy/50" />
        </div>
        <div className="container-wide relative z-10 pb-10">
          <Link to="/services" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-brand-orange mb-4">
            <ArrowLeft className="size-4" /> All Services
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-3 ${service.category === 'plumbing' ? 'bg-brand-blue' : 'bg-brand-orange'}`}>
              {service.category === 'plumbing' ? '🔧 Plumbing' : '⚡ Electrical'}
            </span>
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-white text-balance">{service.title}</h1>
            <p className="text-white/70 mt-3 max-w-2xl">{service.description}</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">What's Included</h2>
            <ul className="grid sm:grid-cols-2 gap-3 mb-10">
              {service.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 bg-card border border-border rounded-xl px-4 py-3">
                  <CheckCircle className="size-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{f}</span>
                </li>
              ))}
            </ul>

            <h2 className="text-2xl font-display font-bold text-foreground mb-4">How It Works</h2>
            <div className="space-y-4 mb-10">
              {[
                { icon: Phone, title: 'Book in 2 minutes', text: 'Online, by phone, or WhatsApp. Tell us the problem and pick a time that suits you.' },
                { icon: Clock, title: 'We arrive on time', text: 'A licensed technician arrives within the confirmed window — same-day for most jobs, 30 minutes for emergencies.' },
                { icon: Shield, title: 'Fixed & guaranteed', text: 'Upfront price approved by you before work starts, backed by our minimum 1-year labor warranty.' },
              ].map((s) => (
                <div key={s.title} className="flex gap-4 bg-card border border-border rounded-xl p-5">
                  <div className="size-11 shrink-0 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                    <s.icon className="size-5 text-brand-orange" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {reviews.length > 0 && (
              <>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <article key={r.id} className="bg-card border border-border rounded-xl p-5">
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`size-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">"{r.text}"</p>
                      <p className="text-xs text-muted-foreground mt-3 font-medium">{r.name} • {r.role}</p>
                    </article>
                  ))}
                </div>
                <Link to="/testimonials" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange mt-5">
                  Read all reviews <ArrowRight className="size-4" />
                </Link>
              </>
            )}
          </div>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 bg-navy text-white rounded-2xl p-6 lg:p-8">
              <p className="text-sm text-white/60">Starting at</p>
              <p className="text-4xl font-display font-bold text-brand-orange tabular-nums mt-1">{priceNote}</p>
              <p className="text-sm text-white/60 mt-2">Final quote confirmed in writing before work begins. No hidden fees, ever.</p>
              <div className="mt-6 space-y-3">
                <Button asChild size="lg" className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
                  <Link to={`/booking?service=${service.id}`}>Book This Service</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full border-white/25 text-white hover:bg-white/10 font-display font-semibold">
                  <a href={`tel:${SITE_CONFIG.emergencyPhone}`}>
                    <Phone className="size-4 mr-2" /> Emergency: {SITE_CONFIG.emergencyPhone}
                  </a>
                </Button>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-white/70">
                <li className="flex gap-2"><Shield className="size-4 text-brand-orange shrink-0 mt-0.5" /> Licensed & insured — {SITE_CONFIG.license}</li>
                <li className="flex gap-2"><Clock className="size-4 text-brand-orange shrink-0 mt-0.5" /> Same-day slots, 24/7 emergency response</li>
                <li className="flex gap-2"><Star className="size-4 text-brand-orange shrink-0 mt-0.5" /> 4.9★ from 2,400+ verified reviews</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-padding bg-muted/30 pt-0">
          <div className="container-wide">
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-8">
              Related <span className="text-brand-orange">Services</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((s, i) => (
                <ServiceCard key={s.id} service={s} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <EmergencyBanner />
    </>
  );
}
