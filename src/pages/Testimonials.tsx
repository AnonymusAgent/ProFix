import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Quote, PenLine, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { fetchTestimonials, submitReview, ApiError } from '@/lib/api';
import { TESTIMONIALS } from '@/constants/mockData';
import type { Testimonial } from '@/types';

export default function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>(TESTIMONIALS);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [service, setService] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const load = () => {
    fetchTestimonials().then((data) => {
      if (data.length) setItems(data);
    });
  };

  useEffect(load, []);

  const avg = items.length ? items.reduce((a, t) => a + t.rating, 0) / items.length : 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 10) {
      toast({ variant: 'destructive', title: 'Review too short', description: 'Please write at least a sentence about your experience.' });
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({ rating, text: text.trim(), service: service || undefined });
      toast({ title: 'Thanks for your review!', description: 'Your review is now live below.' });
      setText('');
      setService('');
      setRating(5);
      load();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not publish review',
        description: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="relative bg-navy py-16 lg:py-20 overflow-hidden">
        <div className="absolute bottom-10 right-[10%] size-40 bg-brand-blue/5 rounded-full blur-3xl" />
        <div className="container-wide relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Reviews</p>
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-white text-balance">
              What Our <span className="text-brand-orange">Customers Say</span>
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`size-5 ${i < Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-white/30'}`} />
                ))}
              </div>
              <span className="text-white/80 font-medium">{avg.toFixed(1)} average from {items.length} reviews</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 gap-6">
              {items.map((t, i) => (
                <motion.article
                  key={t.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 6) * 0.06 }}
                  className="bg-card rounded-2xl border border-border p-6 flex flex-col relative"
                >
                  <Quote className="absolute top-5 right-5 size-7 text-brand-orange/10" />
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} className={`size-4 ${si < t.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed flex-1">"{t.text}"</p>
                  <div className="mt-5 pt-4 border-t border-border flex items-center gap-3">
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.name} className="size-10 rounded-full object-cover" loading="lazy" />
                    ) : (
                      <span className="size-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-display font-bold">{t.name.charAt(0)}</span>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}{t.service ? ` • ${t.service}` : ''}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 bg-card border border-border rounded-2xl p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-11 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                  <PenLine className="size-5 text-brand-orange" />
                </div>
                <h2 className="font-display font-bold text-foreground text-lg">Leave a Review</h2>
              </div>
              {user ? (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-2 mb-4">
                    <Label>Your rating</Label>
                    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" role="radio" aria-checked={rating === n} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>
                          <Star className={`size-7 transition-colors ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted hover:text-amber-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="review-service">Service used (optional)</Label>
                    <input
                      id="review-service"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      placeholder="e.g. Leak Detection"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2 mb-5">
                    <Label htmlFor="review-text">Your review</Label>
                    <Textarea id="review-text" value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="How was your experience with ProFix?" />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
                    {submitting ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
                    Publish Review
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">Posting as {user.name} ({user.email})</p>
                </form>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-5">
                    Create a free account to share your experience and track your bookings in one place.
                  </p>
                  <div className="flex gap-3">
                    <Button asChild className="bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
                      <Link to="/register">Create Account</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/login">Log In</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
