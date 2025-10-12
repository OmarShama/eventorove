// API Response Types for Frontend Communication
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  success: boolean;
}

// User Types
export type UserRole = 'guest' | 'host' | 'admin';

export interface UserDto {
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

export interface VenueImageDto {
  id: string;
  venueId: string;
  path: string;
  idx: number;
  createdAt: string;
}

export interface VenueAmenityDto {
  id: string;
  venueId: string;
  name: string;
  createdAt: string;
}

export interface VenuePackageDto {
  id: string;
  venueId: string;
  name: string;
  description?: string;
  priceEGP: string;
  durationMinutes?: number;
  createdAt: string;
}

export interface AvailabilityRuleDto {
  id: string;
  venueId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  createdAt: string;
}

export interface BlackoutDto {
  id: string;
  venueId: string;
  startDateTime: string;
  endDateTime: string;
  reason?: string;
  createdAt: string;
}

export interface VenueDto {
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

export interface VenueWithDetailsDto extends VenueDto {
  host: UserDto;
  images: VenueImageDto[];
  amenities: VenueAmenityDto[];
  packages: VenuePackageDto[];
  availabilityRules: AvailabilityRuleDto[];
  blackouts: BlackoutDto[];
}

// Booking Types
export type BookingStatus = 'confirmed' | 'cancelled';

export interface BookingDto {
  id: string;
  venueId: string;
  guestId: string;
  startDateTime: string;
  endDateTime: string;
  status: BookingStatus;
  totalPriceEGP: string;
  guestCount: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingWithDetailsDto extends BookingDto {
  venue: VenueDto;
  guest: UserDto;
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

export interface UpdateVenueRequest extends Partial<CreateVenueRequest> {}

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
  venues: VenueWithDetailsDto[];
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

// Admin Types
export interface AdminStatsDto {
  totalVenues: number;
  totalBookings: number;
  totalUsers: number;
  pendingVenues: number;
  revenueThisMonth: string;
  bookingsThisMonth: number;
}
