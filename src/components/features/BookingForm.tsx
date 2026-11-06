import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Loader2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createBooking, fetchServices, ApiError } from '@/lib/api';
import { SERVICES } from '@/constants/mockData';
import type { BookingFormData, Service } from '@/types';

const initialFormState: BookingFormData = {
  name: '', email: '', phone: '', address: '',
  serviceType: 'plumbing', service: '', date: '', time: '',
  description: '', urgency: 'normal',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BookingFormProps {
  /** Pre-select a service by slug, e.g. from /booking?service=leak-detection */
  defaultServiceSlug?: string;
}

export default function BookingForm({ defaultServiceSlug }: BookingFormProps) {
  const [form, setForm] = useState<BookingFormData>(initialFormState);
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [submitted, setSubmitted] = useState<{ id: string; offline: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetchServices().then((list) => {
      if (!cancelled && list.length) setServices(list);
    });
    return () => { cancelled = true; };
  }, []);

  // Pre-select service from URL / prop, and keep type in sync with it
  useEffect(() => {
    if (!defaultServiceSlug) return;
    const svc = services.find((s) => s.id === defaultServiceSlug);
    if (svc) {
      setForm((p) => ({ ...p, service: svc.id, serviceType: svc.category }));
    } else {
      setForm((p) => ({ ...p, service: defaultServiceSlug }));
    }
  }, [defaultServiceSlug, services]);

  const visibleServices = useMemo(
    () => services.filter((s) => form.serviceType === 'emergency' || s.category === form.serviceType),
    [services, form.serviceType],
  );

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'service') {
        const svc = services.find((s) => s.id === value);
        if (svc) next.serviceType = svc.category;
      }
      if (name === 'serviceType' && value !== 'emergency') {
        const current = services.find((s) => s.id === prev.service);
        if (current && current.category !== value) next.service = '';
      }
      return next;
    });
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof BookingFormData, string>> = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!form.phone || form.phone.replace(/\D/g, '').length < 7) next.phone = 'Enter a valid phone number.';
    if (form.email && !EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.date && form.date < today) next.date = 'Please pick a future date.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({ variant: 'destructive', title: 'Check the form', description: 'Some fields need attention.' });
      return;
    }
    setSubmitting(true);
    try {
      const { booking, offline } = await createBooking(form);
      setSubmitted({ id: booking.id, offline });
      toast({
        title: offline ? 'Request Saved' : 'Booking Confirmed!',
        description: offline
          ? 'We could not reach the server, so your request was saved on this device. Please also call us to confirm.'
          : 'We will contact you within 30 minutes to confirm your appointment.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not submit booking',
        description: err instanceof ApiError ? err.message : 'Please try again or call us.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-border p-8 lg:p-12 text-center"
      >
        <div className="size-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-6">
          <CheckCircle className="size-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground mb-2">Booking Submitted!</h3>
        <p className="text-muted-foreground mb-2 max-w-sm mx-auto">
          Thank you for choosing ProFix. Our team will contact you within 30 minutes to confirm your appointment.
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          Reference: <span className="font-mono">{submitted.id.slice(0, 8)}</span>
          {submitted.offline && (
            <span className="inline-flex items-center gap-1 ml-2 text-amber-600">
              <WifiOff className="size-3" /> saved offline
            </span>
          )}
        </p>
        <Button onClick={() => { setSubmitted(null); setForm(initialFormState); }} variant="outline">
          Book Another Service
        </Button>
      </motion.div>
    );
  }

  const fieldError = (key: keyof BookingFormData) =>
    errors[key] ? <p className="text-xs text-destructive mt-1">{errors[key]}</p> : null;

  const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 lg:p-8" noValidate>
      <h3 className="text-xl font-display font-bold text-foreground mb-6">Book an Appointment</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="John Smith" required aria-invalid={!!errors.name} />
          {fieldError('name')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="(555) 123-4567" required aria-invalid={!!errors.phone} />
          {fieldError('phone')}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" aria-invalid={!!errors.email} />
          {fieldError('email')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Service Address</Label>
          <Input id="address" name="address" value={form.address} onChange={handleChange} placeholder="123 Main Street" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="serviceType">Service Type *</Label>
          <select id="serviceType" name="serviceType" value={form.serviceType} onChange={handleChange} className={selectClass}>
            <option value="plumbing">🔧 Plumbing</option>
            <option value="electrical">⚡ Electrical</option>
            <option value="emergency">🚨 Emergency</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="service">Specific Service</Label>
          <select id="service" name="service" value={form.service} onChange={handleChange} className={selectClass}>
            <option value="">General / Not sure yet</option>
            {visibleServices.map((s) => (
              <option key={s.id} value={s.id}>{s.title}{s.price ? ` — ${s.price}` : ''}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="date">Preferred Date</Label>
          <Input id="date" name="date" type="date" min={today} value={form.date} onChange={handleChange} aria-invalid={!!errors.date} />
          {fieldError('date')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Preferred Time</Label>
          <select id="time" name="time" value={form.time} onChange={handleChange} className={selectClass}>
            <option value="">Select time</option>
            <option value="morning">Morning (7–10 AM)</option>
            <option value="midday">Midday (10 AM–1 PM)</option>
            <option value="afternoon">Afternoon (1–5 PM)</option>
            <option value="evening">Evening (5–9 PM)</option>
          </select>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <Label>Urgency Level</Label>
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Urgency level">
          {([
            { value: 'normal', label: 'Standard' },
            { value: 'urgent', label: 'Urgent' },
            { value: 'emergency', label: '🚨 Emergency' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={form.urgency === opt.value}
              onClick={() => setForm((p) => ({ ...p, urgency: opt.value }))}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                form.urgency === opt.value
                  ? 'bg-brand-orange/10 border-brand-orange text-brand-orange'
                  : 'border-border text-muted-foreground hover:border-brand-orange/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <Label htmlFor="description">Describe the Issue</Label>
        <Textarea
          id="description" name="description" value={form.description} onChange={handleChange}
          placeholder="Tell us about the problem you're experiencing..." rows={4}
        />
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
        {submitting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Send className="size-4 mr-2" />}
        {submitting ? 'Submitting…' : 'Submit Booking Request'}
      </Button>
      <p className="text-xs text-muted-foreground text-center mt-3">
        Logged-in customers can track and cancel bookings from their dashboard.
      </p>
    </form>
  );
}
