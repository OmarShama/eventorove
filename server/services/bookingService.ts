import { IStorage } from "../storage";
import { InsertBooking, BookingWithDetails, Venue } from "@shared/schema";
import { AvailabilityService } from "./availabilityService";

export class BookingService {
  private availabilityService: AvailabilityService;

  constructor(private storage: IStorage) {
    this.availabilityService = new AvailabilityService(storage);
  }

  async createBooking(bookingData: InsertBooking): Promise<BookingWithDetails> {
    // Validate venue exists and is approved
    const venue = await this.storage.getVenue(bookingData.venueId);
    if (!venue) {
      throw new Error("Venue not found");
    }
    
    if (venue.status !== 'approved') {
      throw new Error("Venue is not available for booking");
    }

    // Validate booking duration
    const durationMs = bookingData.endDateTime.getTime() - bookingData.startDateTime.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    
    if (durationMinutes < (venue.minBookingMinutes || 30)) {
      throw new Error(`Minimum booking duration is ${venue.minBookingMinutes || 30} minutes`);
    }

    if (venue.maxBookingMinutes && durationMinutes > venue.maxBookingMinutes) {
      throw new Error(`Maximum booking duration is ${venue.maxBookingMinutes} minutes`);
    }

    // Validate capacity
    if (bookingData.guestCount > venue.capacity) {
      throw new Error(`Venue capacity is ${venue.capacity} people`);
    }

    // Check availability
    const isAvailable = await this.availabilityService.checkAvailability(
      bookingData.venueId,
      bookingData.startDateTime,
      durationMinutes
    );

    if (!isAvailable) {
      throw new Error("Venue is not available for the selected time");
    }

    // Calculate total price
    const totalPrice = this.calculatePrice(venue, durationMinutes);
    
    const booking = await this.storage.createBooking({
      ...bookingData,
      totalPriceEGP: totalPrice.toString(),
    });

    // Get booking with details
    const bookingWithDetails = await this.storage.getBooking(booking.id);
    if (!bookingWithDetails) {
      throw new Error("Failed to retrieve booking details");
    }

    return bookingWithDetails;
  }

  private calculatePrice(venue: Venue, durationMinutes: number): number {
    // Convert to hours with 0.5 hour increments
    const hours = Math.ceil(durationMinutes / 30) * 0.5;
    const basePrice = parseFloat(venue.baseHourlyPriceEGP);
    return hours * basePrice;
  }
}
