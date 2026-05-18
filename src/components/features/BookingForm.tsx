import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { BookingFormData } from '@/types';

const initialFormState: BookingFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  serviceType: 'plumbing',
  service: '',
  date: '',
  time: '',
  description: '',
  urgency: 'normal',
};

export default function BookingForm() {
  const [form, setForm] = useState<BookingFormData>(initialFormState);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.serviceType) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill in all required fields.' });
      return;
    }
    const bookings = JSON.parse(localStorage.getItem('profix-bookings') || '[]');
    bookings.push({ ...form, id: Date.now(), createdAt: new Date().toISOString(), status: 'pending' });
    localStorage.setItem('profix-bookings', JSON.stringify(bookings));
    setSubmitted(true);
    toast({ title: 'Booking Confirmed!', description: 'We will contact you shortly to confirm your appointment.' });
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
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          Thank you for choosing ProFix. Our team will contact you within 30 minutes to confirm your appointment.
        </p>
        <Button onClick={() => { setSubmitted(false); setForm(initialFormState); }} variant="outline">
          Book Another Service
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 lg:p-8">
      <h3 className="text-xl font-display font-bold text-foreground mb-6">Book an Appointment</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="John Smith" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="(555) 123-4567" required />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" value={form.address} onChange={handleChange} placeholder="123 Main Street" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="serviceType">Service Type *</Label>
          <select
            id="serviceType"
            name="serviceType"
            value={form.serviceType}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="plumbing">🔧 Plumbing</option>
            <option value="electrical">⚡ Electrical</option>
            <option value="emergency">🚨 Emergency</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Preferred Date</Label>
          <Input id="date" name="date" type="date" value={form.date} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Preferred Time</Label>
          <select
            id="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select time</option>
            <option value="morning">Morning (7-10 AM)</option>
            <option value="midday">Midday (10 AM-1 PM)</option>
            <option value="afternoon">Afternoon (1-5 PM)</option>
            <option value="evening">Evening (5-9 PM)</option>
          </select>
        </div>
      </div>

      {/* Urgency */}
      <div className="mb-4 space-y-2">
        <Label>Urgency Level</Label>
        <div className="flex flex-wrap gap-3">
          {([
            { value: 'normal', label: 'Standard', color: 'border-border hover:border-brand-blue' },
            { value: 'urgent', label: 'Urgent', color: 'border-amber-300 hover:border-amber-400' },
            { value: 'emergency', label: '🚨 Emergency', color: 'border-red-400 hover:border-red-500' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm((p) => ({ ...p, urgency: opt.value }))}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${opt.color} ${
                form.urgency === opt.value
                  ? 'bg-brand-orange/10 border-brand-orange text-brand-orange'
                  : 'text-muted-foreground'
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
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Tell us about the problem you're experiencing..."
          rows={4}
        />
      </div>

      <Button type="submit" size="lg" className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
        <Send className="size-4 mr-2" />
        Submit Booking Request
      </Button>
    </form>
  );
}
