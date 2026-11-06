import { SITE_CONFIG } from '@/constants/config';

const sections = [
  {
    title: 'What we collect',
    body: 'When you book a service, send a message, create an account, or subscribe to our newsletter, we collect the details you provide: name, email, phone number, service address, and a description of the work you need. We also store your bookings and reviews so you can track them in your dashboard.',
  },
  {
    title: 'How we use it',
    body: 'Your information is used only to provide and improve our services: confirming and dispatching appointments, responding to messages, sending service updates, and (with your consent) occasional offers. We never sell your personal data.',
  },
  {
    title: 'Storage & security',
    body: 'Data is stored in a PostgreSQL database (hosted on Neon) over encrypted connections. Passwords are hashed with bcrypt and never stored in plain text. Access is limited to authorised ProFix staff.',
  },
  {
    title: 'Cookies & local storage',
    body: 'We use local storage in your browser to remember your theme, your login session, and — only if our server is unreachable when you submit a form — a temporary offline copy of your request on your own device.',
  },
  {
    title: 'Your rights',
    body: 'You may request a copy or deletion of your personal data at any time by contacting us. Account holders can update their name and phone number directly from the dashboard.',
  },
  {
    title: 'Contact',
    body: `Questions about this policy? Email ${SITE_CONFIG.email} or call ${SITE_CONFIG.phone}.`,
  },
];

export default function Privacy() {
  return (
    <section className="section-padding">
      <div className="container-wide max-w-3xl">
        <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">Legal</p>
        <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">Privacy Policy</h1>
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
