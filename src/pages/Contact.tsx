import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createContactMessage, ApiError } from '@/lib/api';
import { SITE_CONFIG } from '@/constants/config';
import BookingForm from '@/components/features/BookingForm';
import type { ContactFormData } from '@/types';

const contactMethods = [
  {
    icon: Phone,
    title: 'Call Us',
    primary: SITE_CONFIG.phone,
    secondary: `Emergency: ${SITE_CONFIG.emergencyPhone}`,
    action: `tel:${SITE_CONFIG.phone}`,
    color: 'bg-brand-blue/10 text-brand-blue',
  },
  {
    icon: Mail,
    title: 'Email Us',
    primary: SITE_CONFIG.email,
    secondary: 'Response within 2 hours',
    action: `mailto:${SITE_CONFIG.email}`,
    color: 'bg-brand-orange/10 text-brand-orange',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    primary: 'Chat with us',
    secondary: 'Instant messaging support',
    action: `https://wa.me/${SITE_CONFIG.whatsapp}`,
    color: 'bg-green-500/10 text-green-600',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    primary: '1250 Industrial Blvd, Suite 400',
    secondary: 'Metro City, MC 10001',
    action: '#',
    color: 'bg-purple-500/10 text-purple-600',
  },
];

export default function Contact() {
  const [activeTab, setActiveTab] = useState<'contact' | 'booking'>('booking');
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill in all required fields.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      toast({ variant: 'destructive', title: 'Invalid email', description: 'Please enter a valid email address.' });
      return;
    }
    setSending(true);
    try {
      const { offline } = await createContactMessage(contactForm);
      setContactSubmitted(true);
      toast({
        title: 'Message Sent!',
        description: offline
          ? 'Saved on this device — our server was unreachable. We will still see it once you reconnect, or call us anytime.'
          : "We'll get back to you within 2 hours.",
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not send message',
        description: err instanceof ApiError ? err.message : 'Please try again or call us.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy py-16 lg:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-orange/5 to-transparent" />
        <div className="container-wide relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Get In Touch</p>
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-white text-balance">
              Contact <span className="text-brand-orange">Us</span>
            </h1>
            <p className="text-white/60 mt-3 max-w-xl">
              Ready to schedule a service or have questions? Reach out — we're here to help.
            </p>
          </motion.div>

          {/* Contact methods */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {contactMethods.map((m, i) => (
              <motion.a
                key={m.title}
                href={m.action}
                target={m.action.startsWith('http') ? '_blank' : undefined}
                rel={m.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:border-brand-orange/30 hover:bg-white/10 transition-all"
              >
                <div className={`size-11 rounded-xl ${m.color} flex items-center justify-center mb-3`}>
                  <m.icon className="size-5" />
                </div>
                <h3 className="font-display font-semibold text-white text-sm">{m.title}</h3>
                <p className="text-white/80 text-sm mt-1">{m.primary}</p>
                <p className="text-white/40 text-xs mt-0.5">{m.secondary}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="bg-muted/50 border-b border-border">
        <div className="container-wide py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-brand-orange" />
              <span className="font-medium text-foreground">Mon–Fri:</span>
              <span className="text-muted-foreground">{SITE_CONFIG.hours.weekdays}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-brand-blue" />
              <span className="font-medium text-foreground">Sat–Sun:</span>
              <span className="text-muted-foreground">{SITE_CONFIG.hours.weekends}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 bg-green-500 rounded-full animate-pulse-glow" />
              <span className="font-medium text-foreground">Emergency:</span>
              <span className="text-brand-orange font-semibold">{SITE_CONFIG.hours.emergency}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Left — form area */}
            <div className="lg:col-span-7">
              {/* Tab switcher */}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-xl mb-8 w-fit">
                <button
                  onClick={() => setActiveTab('booking')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'booking'
                      ? 'bg-brand-orange text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  📅 Book Appointment
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'contact'
                      ? 'bg-brand-orange text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ✉️ Send Message
                </button>
              </div>

              {activeTab === 'booking' ? (
                <BookingForm />
              ) : contactSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-2xl border border-border p-8 lg:p-12 text-center"
                >
                  <div className="size-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                    <CheckCircle className="size-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Thank you for reaching out. We'll respond within 2 hours during business hours.
                  </p>
                  <Button onClick={() => { setContactSubmitted(false); setContactForm({ name: '', email: '', phone: '', subject: '', message: '' }); }} variant="outline">
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleContactSubmit} className="bg-card rounded-2xl border border-border p-6 lg:p-8">
                  <h3 className="text-xl font-display font-bold text-foreground mb-6">Send Us a Message</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="cname">Full Name *</Label>
                      <Input id="cname" value={contactForm.name} onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))} placeholder="John Smith" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cemail">Email *</Label>
                      <Input id="cemail" type="email" value={contactForm.email} onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))} placeholder="john@example.com" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="cphone">Phone</Label>
                      <Input id="cphone" type="tel" value={contactForm.phone} onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))} placeholder="(555) 123-4567" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="csubject">Subject</Label>
                      <Input id="csubject" value={contactForm.subject} onChange={(e) => setContactForm((p) => ({ ...p, subject: e.target.value }))} placeholder="How can we help?" />
                    </div>
                  </div>
                  <div className="mb-6 space-y-2">
                    <Label htmlFor="cmessage">Message *</Label>
                    <Textarea
                      id="cmessage"
                      value={contactForm.message}
                      onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" disabled={sending} className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
                    <Send className="size-4 mr-2" />
                    {sending ? 'Sending…' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>

            {/* Right — map + info */}
            <div className="lg:col-span-5 space-y-6">
              {/* Map placeholder */}
              <div className="rounded-2xl overflow-hidden border border-border h-64 lg:h-80 bg-muted">
                <iframe
                  title="ProFix Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.30596698663!2d-74.25987368715491!3d40.69714941680757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Info card */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Office Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-5 text-brand-orange shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Address</p>
                      <p className="text-sm text-muted-foreground">{SITE_CONFIG.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="size-5 text-brand-orange shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Phone</p>
                      <p className="text-sm text-muted-foreground">{SITE_CONFIG.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="size-5 text-brand-orange shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">{SITE_CONFIG.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* License card */}
              <div className="bg-navy rounded-2xl p-6 text-white">
                <h3 className="font-display font-bold mb-2">Licensed & Insured</h3>
                <p className="text-white/60 text-sm mb-3">
                  All work performed by certified professionals with full insurance coverage.
                </p>
                <p className="text-xs text-white/40 font-mono">{SITE_CONFIG.license}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
