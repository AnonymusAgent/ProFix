import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin, Youtube, ArrowUpRight } from 'lucide-react';
import { SITE_CONFIG, NAV_LINKS } from '@/constants/config';
import Logo from '@/components/brand/Logo';
import { SERVICE_AREAS } from '@/constants/mockData';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white/80">
      {/* CTA strip */}
      <div className="bg-gradient-to-r from-brand-orange to-brand-orange-dark">
        <div className="container-wide py-8 lg:py-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl lg:text-2xl font-display font-bold text-white">
              Need Urgent Repair? We're Available 24/7
            </h3>
            <p className="text-white/80 mt-1">
              Licensed professionals ready to help — fast response guaranteed.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${SITE_CONFIG.emergencyPhone}`}
              className="flex items-center gap-2 px-6 py-3 bg-white text-navy font-display font-bold rounded-lg hover:bg-white/90 transition-colors shadow-lg"
            >
              <Phone className="size-5" />
              Call Now
            </a>
            <Link
              to="/booking"
              className="flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-display font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Book Online
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link to="/" aria-label="ProFix Services — home" className="inline-block mb-5">
              <Logo light />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
              {SITE_CONFIG.description} Trusted by thousands of homeowners and businesses for reliable, expert solutions.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, href: SITE_CONFIG.social.facebook },
                { icon: Instagram, href: SITE_CONFIG.social.instagram },
                { icon: Twitter, href: SITE_CONFIG.social.twitter },
                { icon: Linkedin, href: SITE_CONFIG.social.linkedin },
                { icon: Youtube, href: SITE_CONFIG.social.youtube },
              ].map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-brand-orange/20 hover:text-brand-orange transition-colors"
                  aria-label="Social media"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/60 hover:text-brand-orange transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div className="lg:col-span-3">
            <h4 className="font-display font-semibold text-white mb-4">Service Areas</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {SERVICE_AREAS.slice(0, 8).map((area) => (
                <li key={area} className="text-sm text-white/60">
                  {area}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="font-display font-semibold text-white mb-4">Contact Us</h4>
            <div className="space-y-4">
              <a href={`tel:${SITE_CONFIG.phone}`} className="flex items-start gap-3 group">
                <Phone className="size-4 mt-0.5 text-brand-orange" />
                <div>
                  <p className="text-sm text-white group-hover:text-brand-orange transition-colors">{SITE_CONFIG.phone}</p>
                  <p className="text-xs text-white/40">Mon–Fri: {SITE_CONFIG.hours.weekdays}</p>
                </div>
              </a>
              <a href={`mailto:${SITE_CONFIG.email}`} className="flex items-start gap-3 group">
                <Mail className="size-4 mt-0.5 text-brand-orange" />
                <p className="text-sm text-white group-hover:text-brand-orange transition-colors">{SITE_CONFIG.email}</p>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="size-4 mt-0.5 text-brand-orange shrink-0" />
                <p className="text-sm text-white/60">{SITE_CONFIG.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-wide py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            © {currentYear} ProFix Services. All rights reserved. {SITE_CONFIG.license}
            <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0">
              A project of <span className="text-white/80 font-medium">Web Loom LLC</span> — © {currentYear} Web Loom LLC.
            </span>
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-white/40 hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-white/40 hover:text-white/70 transition-colors">Terms of Service</Link>
            <Link to="/login" className="text-xs text-white/40 hover:text-white/70 transition-colors">Customer Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
