import { MailService } from '@sendgrid/mail';
import { BookingWithDetails, Venue } from "@shared/schema";
import { storage } from "../storage";

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY not set - email notifications disabled");
}

export class EmailService {
  private mailService?: MailService;
  private fromEmail: string;

  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      this.mailService = new MailService();
      this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
    }
    this.fromEmail = process.env.SMTP_FROM || "Stagea <no-reply@stagea.local>";
  }

  async sendBookingConfirmation(booking: BookingWithDetails): Promise<void> {
    if (!this.mailService) {
      console.log("Email service not configured - skipping booking confirmation email");
      return;
    }

    try {
      // Email to guest
      await this.sendEmail({
        to: booking.guest.email!,
        subject: `Booking Confirmed - ${booking.venue.title}`,
        html: this.generateBookingConfirmationEmail(booking, 'guest'),
      });

      // Email to host
      const venueDetails = await storage.getVenue(booking.venue.id);
      const host = venueDetails?.host;
      if (host?.email) {
        await this.sendEmail({
          to: host.email,
          subject: `New Booking - ${booking.venue.title}`,
          html: this.generateBookingConfirmationEmail(booking, 'host', host),
        });
      }
    } catch (error) {
      console.error("Failed to send booking confirmation emails:", error);
    }
  }

  async sendVenueApprovalNotification(venue: Venue, status: 'approved' | 'rejected'): Promise<void> {
    if (!this.mailService) {
      console.log("Email service not configured - skipping venue approval email");
      return;
    }

    try {
      // Get host details
      const host = await this.getHostByVenueId(venue.id);
      if (!host?.email) return;

      await this.sendEmail({
        to: host.email,
        subject: `Venue ${status === 'approved' ? 'Approved' : 'Rejected'} - ${venue.title}`,
        html: this.generateVenueApprovalEmail(venue, status),
      });
    } catch (error) {
      console.error("Failed to send venue approval email:", error);
    }
  }

  private async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    if (!this.mailService) return;

    await this.mailService.send({
      to: params.to,
      from: this.fromEmail,
      subject: params.subject,
      html: params.html,
    });
  }

  private generateBookingConfirmationEmail(booking: BookingWithDetails, recipient: 'guest' | 'host', host?: any): string {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Cairo',
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(date);
    };

    const isGuest = recipient === 'guest';
    const title = isGuest ? 'Booking Confirmed!' : 'New Booking Received';
    const greeting = isGuest ? `Dear ${booking.guest.firstName || 'Guest'}` : `Dear ${host?.firstName || 'Host'}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1982C4; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .badge { background: #48CAE4; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
          .highlight { color: #1982C4; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
            <p>Stagea - Premium Venue Booking</p>
          </div>
          <div class="content">
            <p>${greeting},</p>
            <p>${isGuest ? 'Your venue booking has been confirmed!' : 'You have received a new booking for your venue.'}</p>
            
            <div class="details">
              <h2>Booking Details</h2>
              <p><strong>Venue:</strong> ${booking.venue.title}</p>
              <p><strong>Location:</strong> ${booking.venue.address}, ${booking.venue.city}</p>
              <p><strong>Date & Time:</strong> ${formatDate(booking.startDateTime)} - ${formatDate(booking.endDateTime)}</p>
              <p><strong>Guests:</strong> ${booking.guestCount} people</p>
              <p><strong>Total Amount:</strong> ${booking.totalPriceEGP} EGP</p>
              ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
              
              <div style="margin: 20px 0;">
                <span class="badge">Instant Booking</span>
                <span class="badge">Pay at Venue</span>
                <span class="badge">Cairo Time</span>
              </div>
            </div>

            ${isGuest ? `
              <h3>Important Reminders:</h3>
              <ul>
                <li>Arrive 15 minutes early for setup</li>
                <li>Payment is due at the venue before your event</li>
                <li>Contact the venue for any special requirements</li>
              </ul>
            ` : `
              <h3>Guest Information:</h3>
              <p><strong>Name:</strong> ${booking.guest.firstName} ${booking.guest.lastName}</p>
              <p><strong>Email:</strong> ${booking.guest.email}</p>
            `}

            <p class="highlight">Booking ID: ${booking.id}</p>
            <p>For any questions, please contact support@stagea.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateVenueApprovalEmail(venue: Venue, status: 'approved' | 'rejected'): string {
    const title = status === 'approved' ? 'Venue Approved!' : 'Venue Application Update';
    const message = status === 'approved' 
      ? 'Congratulations! Your venue has been approved and is now live on Stagea.'
      : 'Thank you for your submission. Unfortunately, your venue application needs some revisions.';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${status === 'approved' ? '#48CAE4' : '#FF6B6B'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
            <p>Stagea - Premium Venue Booking</p>
          </div>
          <div class="content">
            <p>Dear Host,</p>
            <p>${message}</p>
            
            <div class="details">
              <h2>Venue Details</h2>
              <p><strong>Venue:</strong> ${venue.title}</p>
              <p><strong>Location:</strong> ${venue.address}, ${venue.city}</p>
              <p><strong>Category:</strong> ${venue.category}</p>
              <p><strong>Capacity:</strong> ${venue.capacity} people</p>
              <p><strong>Hourly Rate:</strong> ${venue.baseHourlyPriceEGP} EGP</p>
            </div>

            ${status === 'approved' ? `
              <p>Your venue is now available for bookings. Guests can discover and book your space instantly.</p>
            ` : `
              <p>Please review your venue information and resubmit when ready. Our team is here to help you succeed.</p>
            `}

            <p>For any questions, please contact support@stagea.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private async getHostByVenueId(venueId: string): Promise<any> {
    const venue = await storage.getVenue(venueId);
    return venue?.host;
  }
}
