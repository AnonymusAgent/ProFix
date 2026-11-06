import { SERVICES, TESTIMONIALS, FAQ_DATA, PRICING_PLANS, STATS } from '@/constants/mockData';
import type {
  ApiService, AuthUser, BookingFormData, BookingRecord, ContactFormData,
  ContactMessageRecord, AdminStats, FAQItem, PricingPlan, Service, Stat, Testimonial,
} from '@/types';

/**
 * ProFix API client.
 *
 * Base URL comes from VITE_API_URL (default "/api", proxied by Vite to the
 * Express server in dev). Catalog reads fall back to the bundled catalog so
 * the site renders even before the database is connected; writes fall back
 * to a local queue and are flagged `offline` so the UI can be honest about it.
 */

const BASE = (import.meta.env.VITE_API_URL as string | undefined) || '/api';
const TOKEN_KEY = 'profix-token';

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check your connection.');
  }
  const body = (await res.json().catch(() => ({}))) as {
    data?: T;
    error?: { code?: string; message?: string };
  };
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body.error?.code || 'REQUEST_FAILED',
      body.error?.message || `Request failed (${res.status})`,
    );
  }
  return body.data as T;
}

/* ---------- local offline queue (bookings / messages) ---------- */

function readQueue<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function pushQueue<T>(key: string, item: T) {
  const items = readQueue<T>(key);
  items.push(item);
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* storage full / private mode — ignore */
  }
}

/* ---------- catalog (with bundled fallback) ---------- */

function mapApiService(s: ApiService): Service {
  return {
    id: s.slug,
    title: s.title,
    description: s.description,
    icon: s.icon,
    category: s.category,
    features: s.features || [],
    image: s.image || '',
    price: s.price || undefined,
  };
}

export async function fetchServices(params?: { category?: string; q?: string }): Promise<Service[]> {
  try {
    const qs = new URLSearchParams();
    if (params?.category && params.category !== 'all') qs.set('category', params.category);
    if (params?.q) qs.set('q', params.q);
    const { services } = await request<{ services: ApiService[] }>(`/services?${qs.toString()}`);
    return services.map(mapApiService);
  } catch {
    return SERVICES.filter(
      (s) =>
        (!params?.category || params.category === 'all' || s.category === params.category) &&
        (!params?.q ||
          s.title.toLowerCase().includes(params.q.toLowerCase()) ||
          s.description.toLowerCase().includes(params.q.toLowerCase())),
    );
  }
}

export async function fetchService(slug: string): Promise<Service | null> {
  try {
    const { service } = await request<{ service: ApiService }>(`/services/${encodeURIComponent(slug)}`);
    return mapApiService(service);
  } catch {
    return SERVICES.find((s) => s.id === slug) ?? null;
  }
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const { testimonials } = await request<{ testimonials: Testimonial[] }>('/testimonials');
    return testimonials;
  } catch {
    return TESTIMONIALS;
  }
}

export async function fetchFaqs(): Promise<FAQItem[]> {
  try {
    const { faqs } = await request<{ faqs: FAQItem[] }>('/faqs');
    return faqs;
  } catch {
    return FAQ_DATA;
  }
}

export async function fetchPricing(): Promise<PricingPlan[]> {
  try {
    const { plans } = await request<{ plans: PricingPlan[] }>('/pricing');
    return plans;
  } catch {
    return PRICING_PLANS;
  }
}

export async function fetchStats(): Promise<Stat[]> {
  try {
    const { stats } = await request<{ stats: Stat[] }>('/stats');
    return stats;
  } catch {
    return STATS;
  }
}

/* ---------- writes ---------- */

export interface BookingSubmitResult {
  booking: BookingRecord;
  offline: boolean;
}

export async function createBooking(data: BookingFormData): Promise<BookingSubmitResult> {
  try {
    const { booking } = await request<{ booking: BookingRecord }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { booking, offline: false };
  } catch (err) {
    if (err instanceof ApiError && err.status >= 400 && err.status < 500 && err.code !== 'DB_NOT_CONFIGURED') {
      throw err; // real validation error — surface it, don't queue
    }
    const booking: BookingRecord = {
      id: `local-${Date.now()}`,
      serviceSlug: data.service || null,
      name: data.name,
      email: data.email || null,
      phone: data.phone,
      address: data.address || null,
      serviceType: data.serviceType,
      date: data.date || null,
      time: data.time || null,
      urgency: data.urgency,
      description: data.description || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      offline: true,
    };
    pushQueue('profix-pending-bookings', booking);
    return { booking, offline: true };
  }
}

export async function createContactMessage(data: ContactFormData): Promise<{ offline: boolean }> {
  try {
    await request('/contact', { method: 'POST', body: JSON.stringify(data) });
    return { offline: false };
  } catch (err) {
    if (err instanceof ApiError && err.status >= 400 && err.status < 500 && err.code !== 'DB_NOT_CONFIGURED') {
      throw err;
    }
    pushQueue('profix-pending-messages', { ...data, id: `local-${Date.now()}`, createdAt: new Date().toISOString() });
    return { offline: true };
  }
}

export async function subscribeNewsletter(email: string): Promise<void> {
  await request('/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
}

/* ---------- auth ---------- */

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function apiRegister(input: { name: string; email: string; phone?: string; password: string }) {
  const data = await request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(input) });
  tokenStore.set(data.token);
  return data;
}

export async function apiLogin(input: { email: string; password: string }) {
  const data = await request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) });
  tokenStore.set(data.token);
  return data;
}

export async function apiMe(): Promise<AuthUser> {
  const { user } = await request<{ user: AuthUser }>('/auth/me');
  return user;
}

export async function apiUpdateMe(input: { name?: string; phone?: string }): Promise<AuthUser> {
  const { user } = await request<{ user: AuthUser }>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return user;
}

/* ---------- customer ---------- */

export async function fetchMyBookings(): Promise<BookingRecord[]> {
  const { bookings } = await request<{ bookings: BookingRecord[] }>('/bookings/me');
  return bookings;
}

export async function cancelBooking(id: string): Promise<BookingRecord> {
  const { booking } = await request<{ booking: BookingRecord }>(`/bookings/${id}/cancel`, { method: 'PATCH' });
  return booking;
}

export async function submitReview(input: { rating: number; text: string; service?: string }): Promise<void> {
  await request('/testimonials', { method: 'POST', body: JSON.stringify(input) });
}

/* ---------- admin ---------- */

export async function fetchAdminStats(): Promise<AdminStats> {
  const { stats } = await request<{ stats: AdminStats }>('/admin/stats');
  return stats;
}

export async function fetchAdminBookings(params?: { status?: string; q?: string }): Promise<BookingRecord[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.q) qs.set('q', params.q);
  const { bookings } = await request<{ bookings: BookingRecord[] }>(`/bookings?${qs.toString()}`);
  return bookings;
}

export async function updateBooking(id: string, input: { status?: string; assignedTo?: string; adminNotes?: string }) {
  const { booking } = await request<{ booking: BookingRecord }>(`/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return booking;
}

export async function fetchAdminMessages(): Promise<ContactMessageRecord[]> {
  const { messages } = await request<{ messages: ContactMessageRecord[] }>('/contact');
  return messages;
}

export async function markMessageRead(id: string): Promise<void> {
  await request(`/contact/${id}/read`, { method: 'PATCH' });
}

export async function fetchAdminUsers(): Promise<AuthUser[]> {
  const { users } = await request<{ users: AuthUser[] }>('/admin/users');
  return users;
}

export async function updateUserRole(id: string, role: AuthUser['role']): Promise<void> {
  await request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
}

export async function fetchHealth(): Promise<{ db: string; status: string }> {
  return request('/health');
}
