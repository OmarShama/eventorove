import { IStorage } from "../storage";
import { InsertVenue, VenueWithDetails, VenueSearchFilters } from "@shared/schema";

export class VenueService {
  constructor(private storage: IStorage) {}

  async createVenue(venueData: InsertVenue): Promise<VenueWithDetails> {
    // Create the venue
    const venue = await this.storage.createVenue(venueData);
    
    // Return venue with details
    return this.getVenueWithDetails(venue.id);
  }

  async getVenueWithDetails(venueId: string): Promise<VenueWithDetails> {
    const venue = await this.storage.getVenue(venueId);
    if (!venue) {
      throw new Error("Venue not found");
    }
    return venue;
  }

  async searchVenues(filters: VenueSearchFilters): Promise<{ venues: VenueWithDetails[]; total: number }> {
    return await this.storage.searchVenues(filters);
  }

  async updateVenue(venueId: string, updates: Partial<InsertVenue>): Promise<VenueWithDetails> {
    const updatedVenue = await this.storage.updateVenue(venueId, updates);
    if (!updatedVenue) {
      throw new Error("Venue not found");
    }
    return this.getVenueWithDetails(venueId);
  }
}
