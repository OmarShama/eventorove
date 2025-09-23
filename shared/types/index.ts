// Shared types between frontend and backend
export type UserRole = 'guest' | 'host' | 'admin';
export type VenueStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';
export type BookingStatus = 'confirmed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Venue {
  id: string;
  host: User;
  title: string;
  description: string;
  category: string;
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  capacity: number;
  minBookingMinutes: number;
  maxBookingMinutes: number | null;
  bufferMinutes: number;
  baseHourlyPriceEGP: number;
  status: VenueStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface VenueImage {
  id: string;
  venueId: string;
  url: string;
  order: number;
}

export interface VenueAmenity {
  id: string;
  venueId: string;
  name: string;
}

export interface VenuePackage {
  id: string;
  venueId: string;
  name: string;
  description: string;
  hourlyPriceEGP: number;
}

export interface AvailabilityRule {
  id: string;
  venueId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface Blackout {
  id: string;
  venueId: string;
  startDateTime: Date;
  endDateTime: Date;
  reason: string;
}

export interface Booking {
  id: string;
  venue: Venue;
  guest: User;
  startDateTime: Date;
  endDateTime: Date;
  status: BookingStatus;
  totalPriceEGP: number;
  createdAt: Date;
}

export interface VenueWithDetails extends Venue {
  images: VenueImage[];
  amenities: VenueAmenity[];
  packages: VenuePackage[];
  availabilityRules: AvailabilityRule[];
  blackouts: Blackout[];
}

export interface BookingWithDetails extends Booking {
  venue: VenueWithDetails;
}

export interface VenueSearchFilters {
  city?: string;
  category?: string;
  minCapacity?: number;
  maxPricePerHour?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
}

export interface InsertVenue {
  title: string;
  description: string;
  category: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  capacity: number;
  minBookingMinutes?: number;
  maxBookingMinutes?: number;
  bufferMinutes?: number;
  baseHourlyPriceEGP: number;
  images: { url: string; order: number }[];
  amenities: { name: string }[];
  packages: { name: string; description: string; hourlyPriceEGP: number }[];
  availabilityRules: { dayOfWeek: number; openTime: string; closeTime: string }[];
}

export interface InsertBooking {
  venueId: string;
  startDateTime: string;
  endDateTime: string;
}