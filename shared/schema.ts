import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  time,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['guest', 'host', 'admin']);

// Venue status enum
export const venueStatusEnum = pgEnum('venue_status', ['draft', 'pending_approval', 'approved', 'rejected']);

// Booking status enum
export const bookingStatusEnum = pgEnum('booking_status', ['confirmed', 'cancelled']);

// User table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('guest'),
  emailVerifiedAt: timestamp("email_verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Venues table
export const venues = pgTable("venues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hostId: varchar("host_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  lat: decimal("lat", { precision: 10, scale: 8 }),
  lng: decimal("lng", { precision: 11, scale: 8 }),
  capacity: integer("capacity").notNull(),
  baseHourlyPriceEGP: decimal("base_hourly_price_egp", { precision: 10, scale: 2 }).notNull(),
  minBookingMinutes: integer("min_booking_minutes").default(30),
  maxBookingMinutes: integer("max_booking_minutes"), // nullable = "open"
  bufferMinutes: integer("buffer_minutes").default(30),
  status: venueStatusEnum("status").default('draft'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Venue images table
export const venueImages = pgTable("venue_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  venueId: varchar("venue_id").notNull(),
  path: text("path").notNull(),
  idx: integer("idx").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Venue amenities table
export const venueAmenities = pgTable("venue_amenities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  venueId: varchar("venue_id").notNull(),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Venue packages table
export const venuePackages = pgTable("venue_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  venueId: varchar("venue_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  priceEGP: decimal("price_egp", { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer("duration_minutes"), // optional
  createdAt: timestamp("created_at").defaultNow(),
});

// Availability rules table (recurring weekly hours)
export const availabilityRules = pgTable("availability_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  venueId: varchar("venue_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6
  openTime: time("open_time").notNull(), // HH:mm
  closeTime: time("close_time").notNull(), // HH:mm
  createdAt: timestamp("created_at").defaultNow(),
});

// Blackout periods table (host blocked times)
export const blackouts = pgTable("blackouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  venueId: varchar("venue_id").notNull(),
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  venueId: varchar("venue_id").notNull(),
  guestId: varchar("guest_id").notNull(),
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  status: bookingStatusEnum("status").default('confirmed'),
  totalPriceEGP: decimal("total_price_egp", { precision: 10, scale: 2 }).notNull(),
  guestCount: integer("guest_count").notNull(),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  hostedVenues: many(venues),
  bookings: many(bookings),
}));

export const venuesRelations = relations(venues, ({ one, many }) => ({
  host: one(users, {
    fields: [venues.hostId],
    references: [users.id],
  }),
  images: many(venueImages),
  amenities: many(venueAmenities),
  packages: many(venuePackages),
  availabilityRules: many(availabilityRules),
  blackouts: many(blackouts),
  bookings: many(bookings),
}));

export const venueImagesRelations = relations(venueImages, ({ one }) => ({
  venue: one(venues, {
    fields: [venueImages.venueId],
    references: [venues.id],
  }),
}));

export const venueAmenitiesRelations = relations(venueAmenities, ({ one }) => ({
  venue: one(venues, {
    fields: [venueAmenities.venueId],
    references: [venues.id],
  }),
}));

export const venuePackagesRelations = relations(venuePackages, ({ one }) => ({
  venue: one(venues, {
    fields: [venuePackages.venueId],
    references: [venues.id],
  }),
}));

export const availabilityRulesRelations = relations(availabilityRules, ({ one }) => ({
  venue: one(venues, {
    fields: [availabilityRules.venueId],
    references: [venues.id],
  }),
}));

export const blackoutsRelations = relations(blackouts, ({ one }) => ({
  venue: one(venues, {
    fields: [blackouts.venueId],
    references: [venues.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  venue: one(venues, {
    fields: [bookings.venueId],
    references: [venues.id],
  }),
  guest: one(users, {
    fields: [bookings.guestId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVenueImageSchema = createInsertSchema(venueImages).omit({
  id: true,
  createdAt: true,
});

export const insertVenueAmenitySchema = createInsertSchema(venueAmenities).omit({
  id: true,
  createdAt: true,
});

export const insertVenuePackageSchema = createInsertSchema(venuePackages).omit({
  id: true,
  createdAt: true,
});

export const insertAvailabilityRuleSchema = createInsertSchema(availabilityRules).omit({
  id: true,
  createdAt: true,
});

export const insertBlackoutSchema = createInsertSchema(blackouts).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Search filters schema
export const venueSearchSchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  category: z.string().optional(),
  capacityMin: z.number().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  hasPackages: z.boolean().optional(),
  availableAt: z.string().optional(), // ISO datetime
  durationMinutes: z.number().optional(),
  bbox: z.string().optional(), // "minLng,minLat,maxLng,maxLat"
  page: z.number().default(1),
  limit: z.number().default(20),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type Venue = typeof venues.$inferSelect;
export type InsertVenueImage = z.infer<typeof insertVenueImageSchema>;
export type VenueImage = typeof venueImages.$inferSelect;
export type InsertVenueAmenity = z.infer<typeof insertVenueAmenitySchema>;
export type VenueAmenity = typeof venueAmenities.$inferSelect;
export type InsertVenuePackage = z.infer<typeof insertVenuePackageSchema>;
export type VenuePackage = typeof venuePackages.$inferSelect;
export type InsertAvailabilityRule = z.infer<typeof insertAvailabilityRuleSchema>;
export type AvailabilityRule = typeof availabilityRules.$inferSelect;
export type InsertBlackout = z.infer<typeof insertBlackoutSchema>;
export type Blackout = typeof blackouts.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type VenueSearchFilters = z.infer<typeof venueSearchSchema>;

// Full venue type with relations
export type VenueWithDetails = Venue & {
  host: User;
  images: VenueImage[];
  amenities: VenueAmenity[];
  packages: VenuePackage[];
  availabilityRules: AvailabilityRule[];
  blackouts: Blackout[];
};

// Booking with relations
export type BookingWithDetails = Booking & {
  venue: Venue;
  guest: User;
};
