export const SITE_CONFIG = {
  name: 'ProFix',
  tagline: 'Expert Plumbing & Electrical Solutions',
  description: 'Professional 24/7 plumbing and electrical services for homes and businesses.',
  phone: '(555) 247-3690',
  emergencyPhone: '(555) 911-3690',
  email: 'info@profixservices.com',
  address: '1250 Industrial Boulevard, Suite 400, Metro City, MC 10001',
  whatsapp: '+15552473690',
  hours: {
    weekdays: '7:00 AM - 9:00 PM',
    weekends: '8:00 AM - 6:00 PM',
    emergency: '24/7 Available',
  },
  social: {
    facebook: 'https://facebook.com/profixservices',
    instagram: 'https://instagram.com/profixservices',
    twitter: 'https://twitter.com/profixservices',
    linkedin: 'https://linkedin.com/company/profixservices',
    youtube: 'https://youtube.com/profixservices',
  },
  license: 'License #PLB-8847291 | ELC-5523180',
} as const;

export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'FAQ', path: '/faq' },
] as const;
