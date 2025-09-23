import { IStorage } from "../storage";

export class AvailabilityService {
  constructor(private storage: IStorage) {}

  async checkAvailability(venueId: string, startDateTime: Date, durationMinutes: number): Promise<boolean> {
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);
    
    // Get venue details
    const venue = await this.storage.getVenue(venueId);
    if (!venue || venue.status !== 'approved') {
      return false;
    }

    // Convert to Cairo time for day-of-week check
    const cairoStart = new Date(startDateTime.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
    const dayOfWeek = cairoStart.getDay();
    const timeOfDay = `${cairoStart.getHours().toString().padStart(2, '0')}:${cairoStart.getMinutes().toString().padStart(2, '0')}`;

    // Check availability rules
    const availabilityRules = venue.availabilityRules || [];
    const dayRule = availabilityRules.find(rule => rule.dayOfWeek === dayOfWeek);
    
    if (!dayRule) {
      return false; // No availability rule for this day
    }

    // Check if booking time falls within venue hours
    if (timeOfDay < dayRule.openTime || timeOfDay >= dayRule.closeTime) {
      return false;
    }

    // Check end time is also within venue hours
    const cairoEnd = new Date(endDateTime.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
    const endTimeOfDay = `${cairoEnd.getHours().toString().padStart(2, '0')}:${cairoEnd.getMinutes().toString().padStart(2, '0')}`;
    
    if (endTimeOfDay > dayRule.closeTime) {
      return false;
    }

    // Check for blackout periods
    const blackouts = venue.blackouts || [];
    for (const blackout of blackouts) {
      if (this.timeRangesOverlap(
        startDateTime,
        endDateTime,
        blackout.startDateTime,
        blackout.endDateTime
      )) {
        return false;
      }
    }

    // Check for conflicting bookings (including buffer time)
    const bufferMinutes = venue.bufferMinutes || 30;
    const bufferedStart = new Date(startDateTime.getTime() - bufferMinutes * 60 * 1000);
    const bufferedEnd = new Date(endDateTime.getTime() + bufferMinutes * 60 * 1000);

    const conflictingBookings = await this.storage.getConflictingBookings(
      venueId,
      bufferedStart,
      bufferedEnd
    );

    return conflictingBookings.length === 0;
  }

  private timeRangesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean {
    return start1 < end2 && end1 > start2;
  }
}
