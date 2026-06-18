// Shared TypeScript types for the Dental Clinic Platform
// Used by both frontend components and API response handling

// ─── Auth & Users ────────────────────────────────────────────
export type Role = 'ADMIN' | 'SUPER_ADMIN';

export interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

// ─── Bookings ────────────────────────────────────────────────
export type BookingSource = 'ONLINE' | 'PHONE' | 'WHATSAPP';
export type BookingStatus =
  | 'PENDING_OTP'
  | 'PENDING_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';
export type SessionPreference = 'MORNING' | 'EVENING';

export interface Booking {
  id: string;
  patient_name: string;
  patient_email?: string;
  patient_phone: string;
  preferred_date: string;
  preferred_session: SessionPreference;
  source: BookingSource;
  status: BookingStatus;
  assigned_date?: string;
  assigned_session?: SessionPreference;
  appointment_number?: number;
  slot_order?: number;
  otp_verified: boolean;
  notes?: string;
  handled_by?: string;
  review_token?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface DailySchedule {
  date: string;
  morning: Booking[];
  evening: Booking[];
}

// ─── Reviews ─────────────────────────────────────────────────
export type ReviewStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Review {
  id: string;
  booking_id: string;
  patient_name: string;
  content: string;
  rating?: number;
  status: ReviewStatus;
  is_featured: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

// ─── Inventory ───────────────────────────────────────────────
export type InventoryAction = 'RESTOCK' | 'USED' | 'ADJUSTMENT' | 'WRITE_OFF';

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  unit: string;
  current_quantity: number;
  minimum_threshold: number;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryLog {
  id: string;
  inventory_id: string;
  action: InventoryAction;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  notes?: string;
  performed_by?: string;
  created_at: string;
}

// ─── Notifications ────────────────────────────────────────────
export type NotificationType = 'LOW_STOCK' | 'NEW_BOOKING' | 'NEW_REVIEW' | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  target_role: string;
  is_read: boolean;
  created_at: string;
}

// ─── FAQs ────────────────────────────────────────────────────
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  keywords?: string[];
  is_active: boolean;
  created_at: string;
}

// ─── Site Content ─────────────────────────────────────────────
export interface SiteContent {
  key: string;
  value: unknown;
  label?: string;
  updated_at: string;
}

// ─── Blogs ────────────────────────────────────────────────────
export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image?: string;
  is_published: boolean;
  author_id?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

// ─── API Responses ────────────────────────────────────────────
export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
}
