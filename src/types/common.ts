/**
 * Application Type Definitions
 *
 * This file contains shared types used across the application
 * to avoid using 'any' and ensure type safety.
 */

/**
 * Application Status Types
 */
export type ApplicationStatus =
  | "new"
  | "approved"
  | "rejected"
  | "completed"
  | "pending";

/**
 * Application Types
 */
export type ApplicationType =
  | "cash"
  | "food"
  | "clothing"
  | "shelter"
  | "medical"
  | "education"
  | "other";

/**
 * Needy Person Status
 */
export type NeedyPersonStatus = "active" | "inactive" | "pending" | "rejected";

/**
 * Donation Status
 */
export type DonationStatus = "pending" | "completed" | "cancelled";

/**
 * Donation Type
 */
export type DonationType = "cash" | "in_kind" | "sacrifice" | "zakat" | "other";

/**
 * Application Interface
 */
export interface Application {
  id: string;
  application_type: ApplicationType;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  needy_person: NeedyPersonBasic;
  notes?: string | null;
  amount?: number | null;
}

/**
 * Needy Person Basic Info
 */
export interface NeedyPersonBasic {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  status?: NeedyPersonStatus;
}

/**
 * Needy Person Detailed
 * @deprecated Import from @/types/needy.types instead
 * This interface is kept for backward compatibility but should not be used
 */
export interface NeedyPerson extends NeedyPersonBasic {
  identity_number?: string | null;
  email?: string | null;
  address?: string | null;
  date_of_birth?: string | null;
  gender?: "male" | "female" | null;
  city?: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
}

// Re-export the proper NeedyPerson type from needy.types
// TODO: Update all imports to use @/types/needy.types directly
export type { NeedyPerson as NeedyPersonDetailed } from "@/types/needy.types";

/**
 * Donation Interface
 */
export interface Donation {
  id: string;
  amount: number;
  donation_type: DonationType;
  status: DonationStatus;
  created_at: string;
  donor_name?: string | null;
  notes?: string | null;
}

/**
 * Donation Stats
 */
export interface DonationStats {
  today: number;
  thisMonth: number;
  thisYear: number;
  count: number;
  total: number;
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
  data: T;
  error: null | ApiError;
  meta: {
    timestamp: number;
    requestId?: string;
  };
}

/**
 * API Error
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Paginated Response
 * Generic pagination wrapper for API responses
 */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number; // Number of items per page (renamed from pageSize for consistency)
  totalPages: number;
}

// Global Constants
export const CURRENCIES = [
  { value: "TRY", label: "₺ TRY", symbol: "₺" },
  { value: "USD", label: "$ USD", symbol: "$" },
  { value: "EUR", label: "€ EUR", symbol: "€" },
  { value: "GBP", label: "£ GBP", symbol: "£" },
] as const;

export const PAYMENT_METHODS = [
  { value: "cash", label: "Nakit" },
  { value: "bank_transfer", label: "Banka Havalesi" },
  { value: "credit_card", label: "Kredi Kartı" },
  { value: "online", label: "Online Ödeme" },
] as const;

/**
 * Query Options
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  page?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Dashboard Stat Card Props
 */
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  description?: string;
}

/**
 * Form State
 */
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Toast Notification
 */
export interface ToastNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

/**
 * User Role
 */
export type UserRole = "admin" | "moderator" | "user" | "viewer";

/**
 * User Interface
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_sign_in?: string | null;
}

/**
 * Event Type
 */
export type EventType = "meeting" | "distribution" | "visit" | "other";

/**
 * Event Interface
 */
export interface Event {
  id: string;
  title: string;
  description?: string | null;
  event_type: EventType;
  start_date: string;
  end_date?: string | null;
  location?: string | null;
  status: "planned" | "ongoing" | "completed" | "cancelled";
}
