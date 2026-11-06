import { SITE_CONFIG } from '@/constants/config';

const sections = [
  {
    title: 'Services',
    body: 'ProFix provides plumbing and electrical services for residential and commercial customers in the Metro City area. All work is performed by licensed, insured technicians in accordance with local codes.',
  },
  {
    title: 'Bookings & quotes',
    body: 'An online booking is a service request, not a confirmed appointment, until our team contacts you to confirm the time window. You will receive a written, itemised quote and approve it before any work begins. Diagnostic fees are waived when you proceed with the quoted repair.',
  },
  {
    title: 'Pricing & payment',
    body: 'Prices shown on this website are starting prices; the final price depends on the scope confirmed on site. Payment is due on completion unless otherwise agreed in writing. Annual maintenance plans are billed yearly and can be cancelled with 30 days notice.',
  },
  {
    title: 'Warranty',
    body: 'Labor is covered by a minimum 1-year warranty (2 years on Premium Projects). Manufacturer warranties apply to parts and fixtures we supply. The warranty does not cover damage caused by misuse, pre-existing faults outside the agreed scope, or work performed by third parties after our visit.',
  },
  {
    title: 'Cancellations',
    body: 'You may cancel a booking free of charge up to 2 hours before the confirmed window from your dashboard or by phone. Emergency call-outs may incur the quoted call-out fee once a technician has been dispatched.',
  },
  {
    title: 'Accounts & reviews',
    body: 'You are responsible for keeping your account credentials secure. Reviews you publish must reflect your genuine experience; we may moderate reviews that are abusive or unrelated to our services.',
  },
  {
    title: 'Liability',
    body: `To the maximum extent permitted by law, ProFix's liability arising from services is limited to the amount paid for the relevant job. Nothing in these terms limits liability that cannot lawfully be limited. Contact: ${SITE_CONFIG.email}, ${SITE_CONFIG.phone}.`,
  },
];

export default function Terms() {
  return (
    <section className="section-padding">
      <div className="container-wide max-w-3xl">
        <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Legal</p>
        <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <div className="space-y-8">
          {sections.map((s, i) => (
            <div key={s.title}>
              <h2 className="font-display font-semibold text-foreground text-lg mb-2">{i + 1}. {s.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
