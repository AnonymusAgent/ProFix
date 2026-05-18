export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'plumbing' | 'electrical';
  features: string[];
  image: string;
  price?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  service: string;
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  unit: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  experience: string;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceType: 'plumbing' | 'electrical' | 'emergency';
  service: string;
  date: string;
  time: string;
  description: string;
  urgency: 'normal' | 'urgent' | 'emergency';
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}
