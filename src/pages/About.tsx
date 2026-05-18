import { motion } from 'framer-motion';
import { CheckCircle, Users, Target, Eye } from 'lucide-react';
import StatsCounter from '@/components/features/StatsCounter';
import TestimonialCarousel from '@/components/features/TestimonialCarousel';
import { TEAM_MEMBERS } from '@/constants/mockData';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import aboutHero from '@/assets/about-hero.jpg';

const values = [
  { icon: CheckCircle, title: 'Integrity', desc: 'Honest assessments, transparent pricing, and no upselling. We recommend only what you truly need.' },
  { icon: Users, title: 'Reliability', desc: 'On time, every time. We respect your schedule and keep our commitments without exception.' },
  { icon: Target, title: 'Excellence', desc: 'Every job done right the first time. We use premium materials and proven techniques.' },
  { icon: Eye, title: 'Safety', desc: 'Full code compliance and rigorous safety protocols protect your family and property.' },
];

export default function About() {
  const { ref: storyRef, isVisible: storyVisible } = useScrollAnimation();
  const { ref: teamRef, isVisible: teamVisible } = useScrollAnimation();
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollAnimation();

  return (
    <>
      {/* Hero */}
      <section className="relative h-64 lg:h-80 flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={aboutHero} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/80 to-navy/60" />
        </div>
        <div className="container-wide relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">About ProFix</p>
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-white text-balance">
              Our <span className="text-brand-orange">Story</span>
            </h1>
            <p className="text-white/60 mt-3 max-w-xl">
              18+ years of trusted plumbing and electrical expertise — built on honesty, quality, and community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section ref={storyRef} className="section-padding">
        <div className="container-wide">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={storyVisible ? { opacity: 1, x: 0 } : {}}
              className="lg:col-span-5"
            >
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=700&fit=crop"
                  alt="ProFix team at work"
                  className="w-full h-80 lg:h-[480px] object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 glass-card rounded-xl p-4">
                  <p className="text-sm font-display font-bold text-foreground">Founded 2006</p>
                  <p className="text-xs text-muted-foreground">Metro City, MC</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={storyVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.15 }}
              className="lg:col-span-7"
            >
              <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Who We Are</p>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-6 text-balance">
                Built on Craftsmanship, <span className="text-brand-orange">Driven by Service</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-pretty">
                <p>
                  ProFix was founded in 2006 by Marcus Williams, a master plumber with a vision: to create a service company that homeowners could truly trust. What started as a one-man operation has grown into a team of 45+ licensed professionals serving the entire Metro City area.
                </p>
                <p>
                  Over 18 years, we've completed more than 15,000 residential and commercial projects. Our growth has been driven entirely by word-of-mouth and our commitment to doing every job right the first time — no shortcuts, no hidden charges, no surprises.
                </p>
                <p>
                  Today, ProFix is the region's most trusted name in plumbing and electrical services, with a 4.9-star rating across 2,400+ verified reviews. We're proud to serve the community that built us.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-6">
                {[
                  { val: '45+', label: 'Team Members' },
                  { val: '15K+', label: 'Jobs Done' },
                  { val: '4.9★', label: 'Avg Rating' },
                ].map((s) => (
                  <div key={s.label} className="text-center lg:text-left">
                    <p className="text-2xl font-display font-bold text-brand-orange tabular-nums">{s.val}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section ref={valuesRef} className="section-padding bg-muted/50">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={valuesVisible ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Our Values</p>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              What Drives <span className="text-brand-orange">Every Job</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                animate={valuesVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6 text-center"
              >
                <div className="size-14 mx-auto rounded-xl bg-brand-orange/10 flex items-center justify-center mb-4">
                  <v.icon className="size-7 text-brand-orange" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <StatsCounter />

      {/* Team */}
      <section ref={teamRef} className="section-padding">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={teamVisible ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Our Team</p>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              Meet the <span className="text-brand-orange">Experts</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM_MEMBERS.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                animate={teamVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-brand-orange text-white text-xs font-bold rounded-full">
                      {member.experience} exp
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialCarousel />
    </>
  );
}
