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

// Test authentication middleware that bypasses real auth for testing (DEVELOPMENT ONLY)
const testAuthMiddleware = async (req: any, res: any, next: any) => {
  // SECURITY: Only enable in development or when TEST_AUTH flag is set
  if (process.env.NODE_ENV !== 'development' && process.env.TEST_AUTH !== 'true') {
    return isAuthenticated(req, res, next);
  }
  
  // For testing, simulate authenticated user based on query param or default to admin
  const userType = req.query.user || req.headers['x-test-user'] || 'admin';
  
  let userId;
  switch(userType) {
    case 'host':
      userId = 'host-user-456';
      break;
    case 'guest':
      userId = 'guest-user-789';
      break;
    default:
      userId = 'admin-user-123';
  }
  
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Mock the authentication structure expected by routes
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      claims: { sub: user.id, role: user.role }
    };
    
    next();
  } catch (error) {
    res.status(500).json({ message: "Authentication error" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Timezone middleware
  app.use(timezoneMiddleware);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // For testing, check if user preference is set in query param or default to admin
      const userType = req.query.user || 'admin';
      
      let userId;
      switch(userType) {
        case 'host':
          userId = 'host-user-456';
          break;
        case 'guest':
          userId = 'guest-user-789';
          break;
        default:
          userId = 'admin-user-123';
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Store the current user in session for authentication middleware
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        claims: { sub: user.id, role: user.role }
      };
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Venue routes
  app.post('/api/venues', testAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Admin can create venues for any host, hosts can create their own venues
      if (userRole !== 'host' && userRole !== 'admin') {
        return res.status(403).json({ message: "Only hosts and admins can create venues" });
      }

      const venueData = insertVenueSchema.parse({
        ...req.body,
        hostId: req.body.hostId || userId, // Admin can specify hostId, others use their own
        status: userRole === 'admin' ? 'approved' : 'pending_approval' // Admin venues auto-approved
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

  app.patch('/api/venues/:id', testAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const venue = await storage.getVenue(req.params.id);
      
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }

      // Admin can edit any venue, hosts can only edit their own venues
      if (venue.hostId !== userId && userRole !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this venue" });
      }

      const updates = { ...req.body };
      // Admin can change hostId, regular hosts cannot
      if (userRole !== 'admin') {
        delete updates.hostId;
      }
      
      const updatedVenue = await storage.updateVenue(req.params.id, updates);
      res.json(updatedVenue);
    } catch (error) {
      console.error("Error updating venue:", error);
      res.status(400).json({ message: "Failed to update venue" });
    }
  });

  app.delete('/api/venues/:id', testAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const venue = await storage.getVenue(req.params.id);
      
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }

      // Admin can delete any venue, hosts can only delete their own venues
      if (venue.hostId !== userId && userRole !== 'admin') {
        return res.status(403).json({ message: "Not authorized to delete this venue" });
      }
      
      await storage.deleteVenue(req.params.id);
      res.json({ message: "Venue deleted successfully" });
    } catch (error) {
      console.error("Error deleting venue:", error);
      res.status(400).json({ message: "Failed to delete venue" });
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
  app.get('/api/host/venues', testAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const venues = await storage.getVenuesByHost(userId);
      res.json(venues);
    } catch (error) {
      console.error("Error fetching host venues:", error);
      res.status(500).json({ message: "Failed to fetch venues" });
    }
  });

  // Venue image upload
  app.post('/api/venues/:id/images/upload', testAuthMiddleware, async (req: any, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  app.post('/api/venues/:id/images', testAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
  app.post('/api/venues/:id/amenities', testAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
  app.post('/api/venues/:id/packages', testAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
  app.post('/api/venues/:id/availability/rules', testAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
  app.post('/api/venues/:id/blackouts', testAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
  app.post('/api/bookings', testAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Admin can book any venue, guests can book venues
      if (userRole !== 'guest' && userRole !== 'admin') {
        return res.status(403).json({ message: "Only guests and admins can make bookings" });
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

  app.get('/api/bookings/me', testAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getBookingsByGuest(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/host/bookings', testAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getBookingsByHost(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching host bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Admin routes
  app.get('/api/admin/venues', testAuthMiddleware, async (req: any, res) => {
    try {
      const userRole = req.user.role;
      if (userRole !== 'admin') {
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

  app.patch('/api/admin/venues/:id/approve', testAuthMiddleware, async (req: any, res) => {
    try {
      const userRole = req.user.role;
      if (userRole !== 'admin') {
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

  app.patch('/api/admin/venues/:id/reject', testAuthMiddleware, async (req: any, res) => {
    try {
      const userRole = req.user.role;
      if (userRole !== 'admin') {
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

  app.get('/api/admin/stats', testAuthMiddleware, async (req: any, res) => {
    try {
      const userRole = req.user.role;
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/bookings', testAuthMiddleware, async (req: any, res) => {
    try {
      const userRole = req.user.role;
      if (userRole !== 'admin') {
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
