import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ServiceCard from '@/components/features/ServiceCard';
import EmergencyBanner from '@/components/features/EmergencyBanner';
import { SERVICES } from '@/constants/mockData';
import { fetchServices } from '@/lib/api';
import type { Service } from '@/types';
import servicesHero from '@/assets/services-hero.jpg';

export default function Services() {
  const [activeTab, setActiveTab] = useState<'all' | 'plumbing' | 'electrical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>(SERVICES);

  useEffect(() => {
    let cancelled = false;
    fetchServices().then((data) => { if (!cancelled && data.length) setServices(data); });
    return () => { cancelled = true; };
  }, []);

  const filtered = services.filter((s) => {
    const matchTab = activeTab === 'all' || s.category === activeTab;
    const matchSearch =
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <>
      {/* Hero */}
      <section className="relative h-64 lg:h-80 flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={servicesHero} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/80 to-navy/60" />
        </div>
        <div className="container-wide relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider mb-2">What We Offer</p>
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-white text-balance">
              Our <span className="text-brand-orange">Services</span>
            </h1>
            <p className="text-white/60 mt-3 max-w-xl">
              Comprehensive plumbing and electrical solutions for residential and commercial properties.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-background sticky top-16 lg:top-[72px] z-40">
        <div className="container-wide py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
            {([
              { key: 'all', label: 'All Services', count: services.length },
              { key: 'plumbing', label: '🔧 Plumbing', count: services.filter((s) => s.category === 'plumbing').length },
              { key: 'electrical', label: '⚡ Electrical', count: services.filter((s) => s.category === 'electrical').length },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="pl-9"
            />
          </div>
        </div>
      </section>

      {/* Service grid */}
      <section className="section-padding">
        <div className="container-wide">
          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((service, i) => (
                <ServiceCard key={service.id} service={service} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">No services found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </section>

      <EmergencyBanner />
    </>
  );
}
