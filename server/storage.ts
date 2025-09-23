import {
  users,
  venues,
  venueImages,
  venueAmenities,
  venuePackages,
  availabilityRules,
  blackouts,
  bookings,
  type User,
  type UpsertUser,
  type Venue,
  type VenueWithDetails,
  type InsertVenue,
  type VenueImage,
  type InsertVenueImage,
  type VenueAmenity,
  type InsertVenueAmenity,
  type VenuePackage,
  type InsertVenuePackage,
  type AvailabilityRule,
  type InsertAvailabilityRule,
  type Blackout,
  type InsertBlackout,
  type Booking,
  type BookingWithDetails,
  type InsertBooking,
  type VenueSearchFilters,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, gte, lte, like, sql, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUserById(id: string): Promise<User | undefined>;
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Venue operations
  createVenue(venue: InsertVenue): Promise<Venue>;
  getVenue(id: string): Promise<VenueWithDetails | undefined>;
  getVenuesByHost(hostId: string): Promise<Venue[]>;
  updateVenue(id: string, updates: Partial<InsertVenue>): Promise<Venue | undefined>;
  searchVenues(filters: VenueSearchFilters): Promise<{ venues: VenueWithDetails[]; total: number }>;
  getVenuesForAdmin(status?: string): Promise<VenueWithDetails[]>;
  updateVenueStatus(id: string, status: 'approved' | 'rejected'): Promise<Venue | undefined>;

  // Venue image operations
  addVenueImage(image: InsertVenueImage): Promise<VenueImage>;
  getVenueImages(venueId: string): Promise<VenueImage[]>;
  deleteVenueImage(id: string): Promise<boolean>;

  // Venue amenity operations
  addVenueAmenity(amenity: InsertVenueAmenity): Promise<VenueAmenity>;
  getVenueAmenities(venueId: string): Promise<VenueAmenity[]>;
  deleteVenueAmenity(id: string): Promise<boolean>;

  // Venue package operations
  addVenuePackage(pkg: InsertVenuePackage): Promise<VenuePackage>;
  getVenuePackages(venueId: string): Promise<VenuePackage[]>;
  updateVenuePackage(id: string, updates: Partial<InsertVenuePackage>): Promise<VenuePackage | undefined>;
  deleteVenuePackage(id: string): Promise<boolean>;

  // Availability rule operations
  addAvailabilityRule(rule: InsertAvailabilityRule): Promise<AvailabilityRule>;
  getAvailabilityRules(venueId: string): Promise<AvailabilityRule[]>;
  deleteAvailabilityRule(id: string): Promise<boolean>;

  // Blackout operations
  addBlackout(blackout: InsertBlackout): Promise<Blackout>;
  getBlackouts(venueId: string): Promise<Blackout[]>;
  deleteBlackout(id: string): Promise<boolean>;

  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: string): Promise<BookingWithDetails | undefined>;
  getBookingsByGuest(guestId: string): Promise<BookingWithDetails[]>;
  getBookingsByVenue(venueId: string): Promise<BookingWithDetails[]>;
  getBookingsByHost(hostId: string): Promise<BookingWithDetails[]>;
  updateBookingStatus(id: string, status: 'confirmed' | 'cancelled'): Promise<Booking | undefined>;
  getConflictingBookings(venueId: string, startDateTime: Date, endDateTime: Date): Promise<Booking[]>;

  // Admin operations
  getBookingsForAdmin(): Promise<BookingWithDetails[]>;
  getSystemStats(): Promise<{
    totalVenues: number;
    totalBookings: number;
    totalUsers: number;
    pendingVenues: number;
    monthlyRevenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createVenue(venue: InsertVenue): Promise<Venue> {
    const [newVenue] = await db.insert(venues).values(venue).returning();
    return newVenue;
  }

  async getVenue(id: string): Promise<VenueWithDetails | undefined> {
    const result = await db
      .select()
      .from(venues)
      .leftJoin(users, eq(venues.hostId, users.id))
      .where(eq(venues.id, id));

    if (!result[0]) return undefined;

    const venue = result[0].venues;
    const host = result[0].users!;

    const [images, amenities, packages, rules, blackoutsPeriods] = await Promise.all([
      this.getVenueImages(id),
      this.getVenueAmenities(id),
      this.getVenuePackages(id),
      this.getAvailabilityRules(id),
      this.getBlackouts(id),
    ]);

    return {
      ...venue,
      host,
      images,
      amenities,
      packages,
      availabilityRules: rules,
      blackouts: blackoutsPeriods,
    };
  }

  async getVenuesByHost(hostId: string): Promise<Venue[]> {
    return await db.select().from(venues).where(eq(venues.hostId, hostId));
  }

  async updateVenue(id: string, updates: Partial<InsertVenue>): Promise<Venue | undefined> {
    const [venue] = await db
      .update(venues)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(venues.id, id))
      .returning();
    return venue;
  }

  async searchVenues(filters: VenueSearchFilters): Promise<{ venues: VenueWithDetails[]; total: number }> {
    let query = db
      .select()
      .from(venues)
      .leftJoin(users, eq(venues.hostId, users.id))
      .where(eq(venues.status, 'approved'));

    const conditions = [];

    if (filters.q) {
      conditions.push(
        or(
          like(venues.title, `%${filters.q}%`),
          like(venues.description, `%${filters.q}%`)
        )
      );
    }

    if (filters.city) {
      conditions.push(eq(venues.city, filters.city));
    }

    if (filters.category) {
      conditions.push(eq(venues.category, filters.category));
    }

    if (filters.capacityMin) {
      conditions.push(gte(venues.capacity, filters.capacityMin));
    }

    if (filters.priceMin) {
      conditions.push(gte(venues.baseHourlyPriceEGP, filters.priceMin.toString()));
    }

    if (filters.priceMax) {
      conditions.push(lte(venues.baseHourlyPriceEGP, filters.priceMax.toString()));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const offset = (filters.page - 1) * filters.limit;
    const results = await query
      .limit(filters.limit)
      .offset(offset)
      .orderBy(desc(venues.createdAt));

    const venuesWithDetails = await Promise.all(
      results.map(async (result) => {
        const venue = result.venues;
        const host = result.users!;

        const [images, amenities, packages, rules, blackoutsPeriods] = await Promise.all([
          this.getVenueImages(venue.id),
          this.getVenueAmenities(venue.id),
          this.getVenuePackages(venue.id),
          this.getAvailabilityRules(venue.id),
          this.getBlackouts(venue.id),
        ]);

        return {
          ...venue,
          host,
          images,
          amenities,
          packages,
          availabilityRules: rules,
          blackouts: blackoutsPeriods,
        };
      })
    );

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(venues)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return { venues: venuesWithDetails, total: count };
  }

  async getVenuesForAdmin(status?: string): Promise<VenueWithDetails[]> {
    let query = db
      .select()
      .from(venues)
      .leftJoin(users, eq(venues.hostId, users.id));

    if (status) {
      query = query.where(eq(venues.status, status as any));
    }

    const results = await query.orderBy(desc(venues.createdAt));

    return await Promise.all(
      results.map(async (result) => {
        const venue = result.venues;
        const host = result.users!;

        const [images, amenities, packages, rules, blackoutsPeriods] = await Promise.all([
          this.getVenueImages(venue.id),
          this.getVenueAmenities(venue.id),
          this.getVenuePackages(venue.id),
          this.getAvailabilityRules(venue.id),
          this.getBlackouts(venue.id),
        ]);

        return {
          ...venue,
          host,
          images,
          amenities,
          packages,
          availabilityRules: rules,
          blackouts: blackoutsPeriods,
        };
      })
    );
  }

  async updateVenueStatus(id: string, status: 'approved' | 'rejected'): Promise<Venue | undefined> {
    const [venue] = await db
      .update(venues)
      .set({ status, updatedAt: new Date() })
      .where(eq(venues.id, id))
      .returning();
    return venue;
  }

  async addVenueImage(image: InsertVenueImage): Promise<VenueImage> {
    const [newImage] = await db.insert(venueImages).values(image).returning();
    return newImage;
  }

  async getVenueImages(venueId: string): Promise<VenueImage[]> {
    return await db
      .select()
      .from(venueImages)
      .where(eq(venueImages.venueId, venueId))
      .orderBy(asc(venueImages.idx));
  }

  async deleteVenueImage(id: string): Promise<boolean> {
    const result = await db.delete(venueImages).where(eq(venueImages.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async addVenueAmenity(amenity: InsertVenueAmenity): Promise<VenueAmenity> {
    const [newAmenity] = await db.insert(venueAmenities).values(amenity).returning();
    return newAmenity;
  }

  async getVenueAmenities(venueId: string): Promise<VenueAmenity[]> {
    return await db.select().from(venueAmenities).where(eq(venueAmenities.venueId, venueId));
  }

  async deleteVenueAmenity(id: string): Promise<boolean> {
    const result = await db.delete(venueAmenities).where(eq(venueAmenities.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async addVenuePackage(pkg: InsertVenuePackage): Promise<VenuePackage> {
    const [newPackage] = await db.insert(venuePackages).values(pkg).returning();
    return newPackage;
  }

  async getVenuePackages(venueId: string): Promise<VenuePackage[]> {
    return await db.select().from(venuePackages).where(eq(venuePackages.venueId, venueId));
  }

  async updateVenuePackage(id: string, updates: Partial<InsertVenuePackage>): Promise<VenuePackage | undefined> {
    const [pkg] = await db
      .update(venuePackages)
      .set(updates)
      .where(eq(venuePackages.id, id))
      .returning();
    return pkg;
  }

  async deleteVenuePackage(id: string): Promise<boolean> {
    const result = await db.delete(venuePackages).where(eq(venuePackages.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async addAvailabilityRule(rule: InsertAvailabilityRule): Promise<AvailabilityRule> {
    const [newRule] = await db.insert(availabilityRules).values(rule).returning();
    return newRule;
  }

  async getAvailabilityRules(venueId: string): Promise<AvailabilityRule[]> {
    return await db
      .select()
      .from(availabilityRules)
      .where(eq(availabilityRules.venueId, venueId))
      .orderBy(asc(availabilityRules.dayOfWeek));
  }

  async deleteAvailabilityRule(id: string): Promise<boolean> {
    const result = await db.delete(availabilityRules).where(eq(availabilityRules.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async addBlackout(blackout: InsertBlackout): Promise<Blackout> {
    const [newBlackout] = await db.insert(blackouts).values(blackout).returning();
    return newBlackout;
  }

  async getBlackouts(venueId: string): Promise<Blackout[]> {
    return await db
      .select()
      .from(blackouts)
      .where(eq(blackouts.venueId, venueId))
      .orderBy(asc(blackouts.startDateTime));
  }

  async deleteBlackout(id: string): Promise<boolean> {
    const result = await db.delete(blackouts).where(eq(blackouts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBooking(id: string): Promise<BookingWithDetails | undefined> {
    const result = await db
      .select()
      .from(bookings)
      .leftJoin(venues, eq(bookings.venueId, venues.id))
      .leftJoin(users, eq(bookings.guestId, users.id))
      .where(eq(bookings.id, id));

    if (!result[0]) return undefined;

    const booking = result[0].bookings;
    const venue = result[0].venues!;
    const guest = result[0].users!;

    return {
      ...booking,
      venue,
      guest,
    };
  }

  async getBookingsByGuest(guestId: string): Promise<BookingWithDetails[]> {
    const results = await db
      .select()
      .from(bookings)
      .leftJoin(venues, eq(bookings.venueId, venues.id))
      .leftJoin(users, eq(bookings.guestId, users.id))
      .where(eq(bookings.guestId, guestId))
      .orderBy(desc(bookings.startDateTime));

    return results.map((result) => ({
      ...result.bookings,
      venue: result.venues!,
      guest: result.users!,
    }));
  }

  async getBookingsByVenue(venueId: string): Promise<BookingWithDetails[]> {
    const results = await db
      .select()
      .from(bookings)
      .leftJoin(venues, eq(bookings.venueId, venues.id))
      .leftJoin(users, eq(bookings.guestId, users.id))
      .where(eq(bookings.venueId, venueId))
      .orderBy(desc(bookings.startDateTime));

    return results.map((result) => ({
      ...result.bookings,
      venue: result.venues!,
      guest: result.users!,
    }));
  }

  async getBookingsByHost(hostId: string): Promise<BookingWithDetails[]> {
    const results = await db
      .select()
      .from(bookings)
      .leftJoin(venues, eq(bookings.venueId, venues.id))
      .leftJoin(users, eq(bookings.guestId, users.id))
      .where(eq(venues.hostId, hostId))
      .orderBy(desc(bookings.startDateTime));

    return results.map((result) => ({
      ...result.bookings,
      venue: result.venues!,
      guest: result.users!,
    }));
  }

  async updateBookingStatus(id: string, status: 'confirmed' | 'cancelled'): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async getConflictingBookings(venueId: string, startDateTime: Date, endDateTime: Date): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.venueId, venueId),
          eq(bookings.status, 'confirmed'),
          or(
            and(
              lte(bookings.startDateTime, startDateTime),
              gte(bookings.endDateTime, startDateTime)
            ),
            and(
              lte(bookings.startDateTime, endDateTime),
              gte(bookings.endDateTime, endDateTime)
            ),
            and(
              gte(bookings.startDateTime, startDateTime),
              lte(bookings.endDateTime, endDateTime)
            )
          )
        )
      );
  }

  async getBookingsForAdmin(): Promise<BookingWithDetails[]> {
    const results = await db
      .select()
      .from(bookings)
      .leftJoin(venues, eq(bookings.venueId, venues.id))
      .leftJoin(users, eq(bookings.guestId, users.id))
      .orderBy(desc(bookings.createdAt))
      .limit(50);

    return results.map((result) => ({
      ...result.bookings,
      venue: result.venues!,
      guest: result.users!,
    }));
  }

  async getSystemStats(): Promise<{
    totalVenues: number;
    totalBookings: number;
    totalUsers: number;
    pendingVenues: number;
    monthlyRevenue: number;
  }> {
    const [venueStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(venues);

    const [bookingStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings);

    const [userStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [pendingStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(venues)
      .where(eq(venues.status, 'pending_approval'));

    const [revenueStats] = await db
      .select({ total: sql<number>`sum(total_price_egp)` })
      .from(bookings)
      .where(
        and(
          gte(bookings.createdAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
          eq(bookings.status, 'confirmed')
        )
      );

    return {
      totalVenues: venueStats.count,
      totalBookings: bookingStats.count,
      totalUsers: userStats.count,
      pendingVenues: pendingStats.count,
      monthlyRevenue: revenueStats.total || 0,
    };
  }
}

export const storage = new DatabaseStorage();
