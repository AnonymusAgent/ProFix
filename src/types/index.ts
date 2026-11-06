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

/* ---------- Backend / API types ---------- */

export interface ApiService extends Service {
  slug: string;
  priceCents?: number | null;
  isActive?: boolean;
}

export type UserRole = 'customer' | 'admin' | 'technician';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  /** Account standing set by admins (suspension after fraud reports). */
  status?: 'active' | 'suspended';
  createdAt?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface BookingRecord {
  id: string;
  userId?: string | null;
  serviceSlug?: string | null;
  name: string;
  email?: string | null;
  phone: string;
  address?: string | null;
  serviceType: string;
  date?: string | null;
  time?: string | null;
  urgency: string;
  description?: string | null;
  status: BookingStatus;
  assignedTo?: string | null;
  workerEmail?: string | null;
  payoutCents?: number | null;
  createdAt: string;
  /** true when saved locally because the API was unreachable */
  offline?: boolean;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalBookings: number;
  bookingsByStatus: Record<string, number>;
  totalUsers: number;
  unreadMessages: number;
  activeServices: number;
}
