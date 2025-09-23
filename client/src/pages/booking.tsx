import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingWithDetails } from "@shared/schema";
import { formatInTimeZone } from "date-fns-tz";

const CAIRO_TIMEZONE = "Africa/Cairo";

export default function Booking() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const bookingId = params.bookingId!;

  const { data: booking, isLoading, error } = useQuery<BookingWithDetails>({
    queryKey: ['/api/bookings', bookingId],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Booking Not Found</h1>
          <p className="text-muted-foreground mb-4">The booking you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const formatDateTime = (date: Date | string) => {
    return formatInTimeZone(new Date(date), CAIRO_TIMEZONE, "PPP 'at' p");
  };

  const addToCalendar = () => {
    const start = booking.startDateTime instanceof Date ? booking.startDateTime : new Date(booking.startDateTime);
    const end = booking.endDateTime instanceof Date ? booking.endDateTime : new Date(booking.endDateTime);
    
    const startStr = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endStr = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const details = `Venue: ${booking.venue.title}\nLocation: ${booking.venue.address}, ${booking.venue.city}\nGuests: ${booking.guestCount}\nTotal: ₪${booking.totalPriceEGP}`;
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Venue Booking - ${booking.venue.title}`)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(`${booking.venue.address}, ${booking.venue.city}`)}`;
    
    window.open(calendarUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-check text-accent-foreground text-3xl"></i>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">Booking Confirmed!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your venue is reserved and ready for your event.
          </p>
          
          {/* Booking Details */}
          <div className="bg-muted/30 rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
              Booking Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Venue:</span>
                <span className="text-foreground font-medium">{booking.venue.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="text-foreground font-medium">
                  {booking.venue.address}, {booking.venue.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start:</span>
                <span className="text-foreground font-medium">
                  {formatDateTime(booking.startDateTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End:</span>
                <span className="text-foreground font-medium">
                  {formatDateTime(booking.endDateTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Guests:</span>
                <span className="text-foreground font-medium">
                  {booking.guestCount} {booking.guestCount === 1 ? 'person' : 'people'}
                </span>
              </div>
              <div className="border-t border-border pt-3 mt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-foreground">Total Amount:</span>
                  <span className="text-primary">₪{booking.totalPriceEGP}</span>
                </div>
                <div className="flex items-center justify-center mt-2">
                  <Badge className="bg-accent text-accent-foreground">
                    <i className="fas fa-info-circle mr-1"></i>
                    Pay directly at the venue
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex justify-center space-x-4 mb-8">
            <Badge className="bg-accent text-accent-foreground">
              <i className="fas fa-bolt mr-1"></i>
              Instant Booking
            </Badge>
            <Badge className="bg-secondary text-secondary-foreground">
              <i className="fas fa-credit-card mr-1"></i>
              Pay at Venue
            </Badge>
            <Badge className="bg-primary text-primary-foreground">
              <i className="fas fa-clock mr-1"></i>
              Cairo Time
            </Badge>
          </div>

          {/* Important Information */}
          <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 mb-8">
            <h4 className="font-semibold text-foreground mb-2 flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-secondary mr-2"></i>
              Important Reminders
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Arrive 15 minutes early for setup</li>
              <li>• Payment is due at the venue before your event</li>
              <li>• Contact the venue for any special requirements</li>
              <li>• Confirmation email has been sent to your address</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={addToCalendar}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-testid="add-to-calendar-button"
            >
              <i className="fas fa-calendar-alt mr-2"></i>
              Add to Calendar
            </Button>
            <Button 
              variant="outline"
              data-testid="call-venue-button"
            >
              <i className="fas fa-phone mr-2"></i>
              Call Venue
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setLocation('/')}
              data-testid="back-to-home-button"
            >
              <i className="fas fa-home mr-2"></i>
              Back to Home
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            Booking ID: {booking.id} • Need help? Contact support@stagea.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
