import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { VenueService } from "./services/venueService";
import { BookingService } from "./services/bookingService";
import { AvailabilityService } from "./services/availabilityService";
import { EmailService } from "./services/emailService";
import { timezoneMiddleware } from "./middleware/timezone";
import { z } from "zod";
import { insertVenueSchema, insertBookingSchema, venueSearchSchema } from "@shared/schema";

const venueService = new VenueService(storage);
const bookingService = new BookingService(storage);
const availabilityService = new AvailabilityService(storage);
const emailService = new EmailService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Timezone middleware
  app.use(timezoneMiddleware);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id || req.user.claims?.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Venue routes
  app.post('/api/venues', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'host' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Only hosts can create venues" });
      }

      const venueData = insertVenueSchema.parse({
        ...req.body,
        hostId: userId,
        status: 'pending_approval'
      });

      const venue = await venueService.createVenue(venueData);
      res.status(201).json(venue);
    } catch (error) {
      console.error("Error creating venue:", error);
      res.status(400).json({ message: "Failed to create venue" });
    }
  });

  app.get('/api/venues/search', async (req, res) => {
    try {
      const filters = venueSearchSchema.parse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        capacityMin: req.query.capacityMin ? parseInt(req.query.capacityMin as string) : undefined,
        priceMin: req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined,
        priceMax: req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined,
        durationMinutes: req.query.durationMinutes ? parseInt(req.query.durationMinutes as string) : undefined,
        hasPackages: req.query.hasPackages === 'true',
        amenities: req.query.amenities ? (Array.isArray(req.query.amenities) ? req.query.amenities : [req.query.amenities]) : undefined,
      });

      const result = await venueService.searchVenues(filters);
      res.json(result);
    } catch (error) {
      console.error("Error searching venues:", error);
      res.status(500).json({ message: "Failed to search venues" });
    }
  });

  app.get('/api/venues/:id', async (req, res) => {
    try {
      const venue = await venueService.getVenueWithDetails(req.params.id);
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      res.json(venue);
    } catch (error) {
      console.error("Error fetching venue:", error);
      res.status(500).json({ message: "Failed to fetch venue" });
    }
  });

  app.patch('/api/venues/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const venue = await storage.getVenue(req.params.id);
      
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }

      if (venue.hostId !== userId && req.user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this venue" });
      }

      const updates = { ...req.body };
      delete updates.hostId; // Prevent hostId changes
      
      const updatedVenue = await storage.updateVenue(req.params.id, updates);
      res.json(updatedVenue);
    } catch (error) {
      console.error("Error updating venue:", error);
      res.status(400).json({ message: "Failed to update venue" });
    }
  });

  app.get('/api/venues/:id/availability', async (req, res) => {
    try {
      const { start, durationMinutes } = req.query;
      
      if (!start || !durationMinutes) {
        return res.status(400).json({ message: "start and durationMinutes are required" });
      }

      const startDate = new Date(start as string);
      const duration = parseInt(durationMinutes as string);
      
      const isAvailable = await availabilityService.checkAvailability(
        req.params.id,
        startDate,
        duration
      );

      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  // Host venue management
  app.get('/api/host/venues', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const venues = await storage.getVenuesByHost(userId);
      res.json(venues);
    } catch (error) {
      console.error("Error fetching host venues:", error);
      res.status(500).json({ message: "Failed to fetch venues" });
    }
  });

  // Venue image upload
  app.post('/api/venues/:id/images/upload', isAuthenticated, async (req: any, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  app.post('/api/venues/:id/images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const venue = await storage.getVenue(req.params.id);
      
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }

      if (venue.hostId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      if (!req.body.imageURL) {
        return res.status(400).json({ message: "imageURL is required" });
      }

      // Check image limit (max 20 images)
      const existingImages = await storage.getVenueImages(req.params.id);
      if (existingImages.length >= 20) {
        return res.status(400).json({ message: "Maximum 20 images per venue" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public",
        }
      );

      const image = await storage.addVenueImage({
        venueId: req.params.id,
        path: objectPath,
        idx: existingImages.length,
      });

      res.status(201).json({ objectPath, image });
    } catch (error) {
      console.error("Error adding venue image:", error);
      res.status(500).json({ message: "Failed to add venue image" });
    }
  });

  // Venue amenities
  app.post('/api/venues/:id/amenities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const venue = await storage.getVenue(req.params.id);
      
      if (!venue || venue.hostId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const amenity = await storage.addVenueAmenity({
        venueId: req.params.id,
        name: req.body.name,
      });

      res.status(201).json(amenity);
    } catch (error) {
      console.error("Error adding amenity:", error);
      res.status(500).json({ message: "Failed to add amenity" });
    }
  });

  // Venue packages
  app.post('/api/venues/:id/packages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const venue = await storage.getVenue(req.params.id);
      
      if (!venue || venue.hostId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const pkg = await storage.addVenuePackage({
        venueId: req.params.id,
        name: req.body.name,
        description: req.body.description,
        priceEGP: req.body.priceEGP,
        durationMinutes: req.body.durationMinutes,
      });

      res.status(201).json(pkg);
    } catch (error) {
      console.error("Error adding package:", error);
      res.status(500).json({ message: "Failed to add package" });
    }
  });

  // Availability rules
  app.post('/api/venues/:id/availability/rules', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const venue = await storage.getVenue(req.params.id);
      
      if (!venue || venue.hostId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const rule = await storage.addAvailabilityRule({
        venueId: req.params.id,
        dayOfWeek: req.body.dayOfWeek,
        openTime: req.body.openTime,
        closeTime: req.body.closeTime,
      });

      res.status(201).json(rule);
    } catch (error) {
      console.error("Error adding availability rule:", error);
      res.status(500).json({ message: "Failed to add availability rule" });
    }
  });

  // Blackouts
  app.post('/api/venues/:id/blackouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const venue = await storage.getVenue(req.params.id);
      
      if (!venue || venue.hostId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const blackout = await storage.addBlackout({
        venueId: req.params.id,
        startDateTime: new Date(req.body.startDateTime),
        endDateTime: new Date(req.body.endDateTime),
        reason: req.body.reason,
      });

      res.status(201).json(blackout);
    } catch (error) {
      console.error("Error adding blackout:", error);
      res.status(500).json({ message: "Failed to add blackout" });
    }
  });

  // Booking routes
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'guest' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Only guests can make bookings" });
      }

      const bookingData = {
        ...req.body,
        guestId: userId,
        startDateTime: new Date(req.body.startDateTime),
        endDateTime: new Date(req.body.endDateTime),
      };

      const booking = await bookingService.createBooking(bookingData);
      
      // Send confirmation emails
      await emailService.sendBookingConfirmation(booking);
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create booking" });
    }
  });

  app.get('/api/bookings/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getBookingsByGuest(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/host/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getBookingsByHost(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching host bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Admin routes
  app.get('/api/admin/venues', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const status = req.query.status as string;
      const venues = await storage.getVenuesForAdmin(status);
      res.json(venues);
    } catch (error) {
      console.error("Error fetching venues for admin:", error);
      res.status(500).json({ message: "Failed to fetch venues" });
    }
  });

  app.patch('/api/admin/venues/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const venue = await storage.updateVenueStatus(req.params.id, 'approved');
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }

      // Send approval email to host
      await emailService.sendVenueApprovalNotification(venue, 'approved');
      
      res.json(venue);
    } catch (error) {
      console.error("Error approving venue:", error);
      res.status(500).json({ message: "Failed to approve venue" });
    }
  });

  app.patch('/api/admin/venues/:id/reject', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const venue = await storage.updateVenueStatus(req.params.id, 'rejected');
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }

      // Send rejection email to host
      await emailService.sendVenueApprovalNotification(venue, 'rejected');
      
      res.json(venue);
    } catch (error) {
      console.error("Error rejecting venue:", error);
      res.status(500).json({ message: "Failed to reject venue" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const bookings = await storage.getBookingsForAdmin();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings for admin:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Object storage routes for serving files
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
