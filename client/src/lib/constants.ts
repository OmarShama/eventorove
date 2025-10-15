// Application constants
export const APP_NAME = "Eventorove";

// Timezone
export const CAIRO_TIMEZONE = "Africa/Cairo";

// API endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

// Google Maps
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Venue categories
export const VENUE_CATEGORIES = [
  "Meeting Rooms",
  "Event Halls",
  "Creative Studios",
  "Outdoor Spaces",
  "Conference Centers",
  "Workshops",
  "Co-working Spaces",
  "Party Venues",
] as const;

// Cairo cities/areas
export const CAIRO_CITIES = [
  "New Cairo",
  "Heliopolis",
  "Zamalek",
  "Maadi",
  "Dokki",
  "Giza",
  "Nasr City",
  "Downtown Cairo",
] as const;

// Common amenities
export const COMMON_AMENITIES = [
  "Wi-Fi",
  "Parking",
  "A/V Equipment",
  "Catering",
  "Air Conditioning",
  "Coffee Service",
  "Phone System",
  "Projector",
  "Sound System",
  "Valet Parking",
] as const;

// Booking constraints
export const BOOKING_CONSTRAINTS = {
  MIN_BOOKING_MINUTES: 30,
  DEFAULT_BUFFER_MINUTES: 30,
  MAX_IMAGES_PER_VENUE: 20,
  MAX_IMAGE_SIZE_MB: 5,
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
} as const;

// Pricing
export const CURRENCY = {
  SYMBOL: "₪",
  CODE: "EGP",
  NAME: "Egyptian Pound",
} as const;

// Venue status options
export const VENUE_STATUSES = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

// Booking status options
export const BOOKING_STATUSES = {
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
} as const;

// User roles
export const USER_ROLES = {
  GUEST: "guest",
  HOST: "host",
  ADMIN: "admin",
} as const;

// Date/time formats
export const DATE_FORMATS = {
  DISPLAY: "PPP 'at' p",
  DATE_ONLY: "PPP",
  TIME_ONLY: "p",
  ISO: "yyyy-MM-dd'T'HH:mm",
  SHORT_DATE: "MMM d, yyyy",
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_GOOGLE_MAPS: !!GOOGLE_MAPS_API_KEY,
  ENABLE_EMAIL_NOTIFICATIONS: !!process.env.SENDGRID_API_KEY,
  ENABLE_OBJECT_STORAGE: !!process.env.PRIVATE_OBJECT_DIR,
} as const;

// Contact information
export const CONTACT = {
  SUPPORT_EMAIL: "support@Eventorove.com",
  PHONE: "+20 xxx xxxx xxx",
} as const;

// Social links
export const SOCIAL_LINKS = {
  FACEBOOK: "https://facebook.com/Eventorove",
  TWITTER: "https://twitter.com/Eventorove",
  INSTAGRAM: "https://instagram.com/Eventorove",
  LINKEDIN: "https://linkedin.com/company/Eventorove",
} as const;

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  VENUE_DETAILS: 300, // 5 minutes
  SEARCH_RESULTS: 60, // 1 minute
  USER_PROFILE: 900, // 15 minutes
  STATIC_CONTENT: 3600, // 1 hour
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: "Something went wrong. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
} as const;

// Success messages  
export const SUCCESS_MESSAGES = {
  VENUE_CREATED: "Venue created successfully and submitted for review.",
  VENUE_UPDATED: "Venue updated successfully.",
  BOOKING_CREATED: "Booking confirmed successfully!",
  BOOKING_CANCELLED: "Booking cancelled successfully.",
  PROFILE_UPDATED: "Profile updated successfully.",
} as const;

// Validation rules
export const VALIDATION = {
  VENUE_TITLE_MAX_LENGTH: 100,
  VENUE_DESCRIPTION_MIN_LENGTH: 10,
  VENUE_DESCRIPTION_MAX_LENGTH: 1000,
  VENUE_MAX_CAPACITY: 1000,
  VENUE_MIN_CAPACITY: 1,
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Default coordinates for Cairo
export const DEFAULT_COORDINATES = {
  lat: 30.0444,
  lng: 31.2357,
  zoom: 11,
} as const;

// Map styles for Google Maps
export const MAP_STYLES = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
] as const;

// Duration options for bookings (in minutes)
export const DURATION_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1h 30m" },
  { value: 120, label: "2 hours" },
  { value: 150, label: "2h 30m" },
  { value: 180, label: "3 hours" },
  { value: 210, label: "3h 30m" },
  { value: 240, label: "4 hours" },
  { value: 300, label: "5 hours" },
  { value: 360, label: "6 hours" },
  { value: 420, label: "7 hours" },
  { value: 480, label: "8 hours" },
  { value: 600, label: "10 hours" },
  { value: 720, label: "12 hours" },
] as const;

// Capacity ranges for filtering
export const CAPACITY_RANGES = [
  { label: "Any size", value: "" },
  { label: "1-10 people", value: "1", max: 10 },
  { label: "11-50 people", value: "11", max: 50 },
  { label: "51-100 people", value: "51", max: 100 },
  { label: "100+ people", value: "101" },
] as const;

// Price ranges (in EGP per hour)
export const PRICE_RANGES = [
  { label: "Any price", min: null, max: null },
  { label: "Under ₪500", min: null, max: 500 },
  { label: "₪500 - ₪1,000", min: 500, max: 1000 },
  { label: "₪1,000 - ₪2,000", min: 1000, max: 2000 },
  { label: "₪2,000+", min: 2000, max: null },
] as const;

// Time slots for availability rules  
export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  return { value: timeString, label: displayTime };
});

// Days of week for availability rules
export const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
] as const;

// Export types for better type safety
export type VenueCategory = typeof VENUE_CATEGORIES[number];
export type CairoCity = typeof CAIRO_CITIES[number];
export type CommonAmenity = typeof COMMON_AMENITIES[number];
export type VenueStatus = typeof VENUE_STATUSES[keyof typeof VENUE_STATUSES];
export type BookingStatus = typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
