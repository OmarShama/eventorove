// Frontend API Types - These should match the backend API response types

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  success: boolean;
}

// User Types
export type UserRole = 'guest' | 'host' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: UserRole;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Venue Types
export type VenueStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

export interface VenueImage {
  id: string;
  venueId: string;
  path: string;
  idx: number;
  createdAt: string;
}

export interface VenueAmenity {
  id: string;
  venueId: string;
  name: string;
  createdAt: string;
}

export interface VenuePackage {
  id: string;
  venueId: string;
  name: string;
  description?: string;
  priceEGP: string;
  durationMinutes?: number;
  createdAt: string;
}

export interface AvailabilityRule {
  id: string;
  venueId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  createdAt: string;
}

export interface Blackout {
  id: string;
  venueId: string;
  startDateTime: string;
  endDateTime: string;
  reason?: string;
  createdAt: string;
}

export interface Venue {
  id: string;
  hostId: string;
  title: string;
  description?: string;
  category: string;
  address: string;
  city: string;
  lat?: string;
  lng?: string;
  capacity: number;
  baseHourlyPriceEGP: string;
  minBookingMinutes: number;
  maxBookingMinutes?: number;
  bufferMinutes: number;
  status: VenueStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VenueWithDetails extends Venue {
  host: User;
  images: VenueImage[];
  amenities: VenueAmenity[];
  packages: VenuePackage[];
  availabilityRules: AvailabilityRule[];
  blackouts: Blackout[];
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  venueId: string;
  guestId: string;
  startDateTime: string;
  endDateTime: string;
  status: BookingStatus;
  totalPriceEGP: string;
  guestCount: number;
  specialRequests?: string;
  cancellationReason?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookingWithDetails extends Booking {
  venue: Venue;
  guest: User;
}

// Calendar and Analytics Types
export interface CalendarBooking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestCount: number;
  startDateTime: string;
  endDateTime: string;
  status: BookingStatus;
  totalPriceEGP: number;
  venueName: string;
  packageName?: string;
  notes?: string;
}

export interface RevenueData {
  period: string;
  revenue: number;
  bookings: number;
  averageBookingValue: number;
  cancellationRate: number;
  growth: number;
}

export interface VenueRevenueData {
  venueId: string;
  venueName: string;
  revenue: number;
  bookings: number;
  averageBookingValue: number;
  utilizationRate: number;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  cancellationRate: number;
  topVenues: VenueRevenueData[];
  revenueByPeriod: RevenueData[];
  bookingsByStatus: Record<BookingStatus, number>;
}

// Package Management Types
export interface PackageFormData {
  name: string;
  description: string;
  priceEGP: number;
  durationMinutes: number;
  maxGuests?: number;
  isPopular: boolean;
  isActive: boolean;
  features: string[];
}

// Availability Management Types
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBlocked: boolean;
  reason?: string;
}

export interface DayAvailability {
  date: string;
  timeSlots: TimeSlot[];
  isBlackout: boolean;
  blackoutReason?: string;
}

export interface RecurringRule {
  id: string;
  name: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  isActive: boolean;
  createdAt: string;
}

// Image Management Types
export interface VenueImageDetails extends VenueImage {
  alt?: string;
  caption?: string;
  isMain: boolean;
  order: number;
  size?: number;
  width?: number;
  height?: number;
  uploadedAt: string;
}

// Request Types
export interface CreateVenueRequest {
  title: string;
  description?: string;
  category: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  capacity: number;
  baseHourlyPriceEGP: number;
  minBookingMinutes?: number;
  maxBookingMinutes?: number;
  bufferMinutes?: number;
}

export interface UpdateVenueRequest extends Partial<CreateVenueRequest> { }

export interface CreateBookingRequest {
  venueId: string;
  startDateTime: string;
  endDateTime: string;
  guestCount: number;
  specialRequests?: string;
}

export interface VenueSearchRequest {
  q?: string;
  city?: string;
  category?: string;
  capacityMin?: number;
  priceMin?: number;
  priceMax?: number;
  amenities?: string[];
  hasPackages?: boolean;
  availableAt?: string;
  durationMinutes?: number;
  bbox?: string;
  page?: number;
  limit?: number;
}

export interface VenueSearchResponse {
  venues: VenueWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AvailabilityCheckRequest {
  start: string;
  durationMinutes: number;
}

export interface AvailabilityCheckResponse {
  available: boolean;
  conflicts?: string[];
  suggestedTimes?: string[];
}

// Auth Types
export interface LoginResponse extends User {
  accessToken: string;
}

// Filter Types
export interface CalendarFilters {
  search?: string;
  status?: 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed';
  venueId?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  guestCountRange?: {
    min?: number;
    max?: number;
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
}

export interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
    preset?: string;
  };
  venues?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  guestRange?: {
    min?: number;
    max?: number;
  };
  bookingStatus?: string[];
  groupBy?: 'day' | 'week' | 'month' | 'quarter';
}

// Export Configuration Types
export interface ExportConfig {
  format: 'pdf' | 'csv' | 'excel' | 'png';
  sections: {
    summary: boolean;
    revenueChart: boolean;
    venuePerformance: boolean;
    detailedBreakdown: boolean;
    bookingsList: boolean;
  };
  dateRange: {
    start: string;
    end: string;
  };
  customizations: {
    includeCharts: boolean;
    includeLogos: boolean;
    includeSummary: boolean;
    pageOrientation: 'portrait' | 'landscape';
  };
}

// Admin Types
export interface AdminStats {
  totalVenues: number;
  totalBookings: number;
  totalUsers: number;
  pendingVenues: number;
  revenueThisMonth: string;
  bookingsThisMonth: number;
}

// User Management Types
export interface UserDto extends User {
  status?: 'active' | 'suspended' | 'banned';
}

// Settings Types
export interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  requireEmailVerification: boolean;
  defaultBookingDuration: number;
  maxBookingDuration: number;
  bookingAdvanceNotice: number;
  cancellationPolicy: string;
  refundPolicy: string;
}
