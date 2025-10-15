import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DateTimeRangePicker from "@/components/DateTimeRangePicker";
import MapView from "@/components/MapView";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { VenueWithDetails } from "@/types/api";

export default function VenueDetail() {
  const router = useRouter();
  const params = router.query;
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const venueId = params.id!;

  const [startDateTime, setStartDateTime] = useState<Date | null>(null);
  const [endDateTime, setEndDateTime] = useState<Date | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [guestCount, setGuestCount] = useState(1);

  const { data: venue, isLoading, error } = useQuery<VenueWithDetails>({
    queryKey: ['/api/venues', venueId],
    queryFn: async () => {
      const response = await fetch(`/api/venues/${venueId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch venue');
      }
      return response.json();
    },
  });

  const { data: availability, isLoading: checkingAvailability } = useQuery({
    queryKey: ['/api/venues', venueId, 'availability', startDateTime, durationMinutes],
    queryFn: async () => {
      if (!startDateTime) return null;

      const params = new URLSearchParams({
        start: startDateTime.toISOString(),
        durationMinutes: durationMinutes.toString(),
      });

      const response = await fetch(`/api/venues/${venueId}/availability?${params}`);
      if (!response.ok) {
        throw new Error('Failed to check availability');
      }
      return response.json();
    },
    enabled: !!startDateTime,
  });

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!startDateTime || !endDateTime || !venue) {
        throw new Error('Missing booking information');
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId,
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          guestCount,
          totalPriceEGP: calculateTotalPrice(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      return response.json();
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['/api/venues', venueId, 'availability'] });
      router.push(`/booking/${booking.id}`);
      toast({
        title: "Booking Confirmed!",
        description: "Your venue has been successfully booked.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to make a booking.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }

      toast({
        title: "Booking Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleDateTimeChange = (start: Date, end: Date, duration: number) => {
    setStartDateTime(start);
    setEndDateTime(end);
    setDurationMinutes(duration);
  };

  const calculateTotalPrice = () => {
    if (!venue || !durationMinutes) return 0;
    const hours = Math.ceil(durationMinutes / 30) * 0.5;
    return hours * parseFloat(venue.baseHourlyPriceEGP);
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to make a booking.",
        variant: "destructive",
      });
      window.location.href = "/api/login";
      return;
    }

    if (user?.role !== 'guest' && user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only guests can make bookings.",
        variant: "destructive",
      });
      return;
    }

    if (!availability?.available) {
      toast({
        title: "Not Available",
        description: "This venue is not available for the selected time.",
        variant: "destructive",
      });
      return;
    }

    bookingMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Venue Not Found</h1>
          <p className="text-muted-foreground mb-4">The venue you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/search')}>
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const mainImage = venue.images?.[0]?.path || "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/search')}
                data-testid="back-to-search"
              >
                <i className="fas fa-arrow-left"></i>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{venue.title}</h1>
                <p className="text-muted-foreground">{venue.address}, {venue.city}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <i className="fas fa-star text-secondary mr-1"></i>
                <span className="text-sm font-medium">4.8</span>
                <span className="text-muted-foreground text-sm ml-1">(24 reviews)</span>
              </div>
              <Button variant="ghost" size="sm">
                <i className="fas fa-share-alt"></i>
              </Button>
              <Button variant="ghost" size="sm">
                <i className="far fa-heart"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="relative rounded-2xl overflow-hidden aspect-video lg:aspect-square">
            <img
              src={mainImage}
              alt={venue.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {venue.images?.slice(1, 5).map((image, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden aspect-square">
                <img
                  src={image.path}
                  alt={`${venue.title} ${index + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {venue.images && venue.images.length > 5 && (
              <div className="relative rounded-xl overflow-hidden aspect-square bg-black/10 flex items-center justify-center cursor-pointer">
                <div className="text-center">
                  <i className="fas fa-plus text-2xl text-white mb-2"></i>
                  <p className="text-white font-medium">+{venue.images.length - 4} more</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Key Features */}
            <div className="flex items-center space-x-6 mb-8 p-4 bg-muted/30 rounded-2xl">
              <div className="flex items-center">
                <i className="fas fa-bolt text-accent text-xl mr-2"></i>
                <span className="font-medium text-foreground">Instant Booking</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-credit-card text-secondary text-xl mr-2"></i>
                <span className="font-medium text-foreground">Pay at Venue</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-clock text-primary text-xl mr-2"></i>
                <span className="font-medium text-foreground">Cairo Time</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">About this venue</h2>
              <p className="text-muted-foreground leading-relaxed">
                {venue.description}
              </p>
            </div>

            {/* Venue Details */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Venue Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <i className="fas fa-users text-primary text-xl mr-3"></i>
                    <div>
                      <span className="font-medium text-foreground">Capacity</span>
                      <p className="text-muted-foreground">{venue.capacity} people</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-tag text-primary text-xl mr-3"></i>
                    <div>
                      <span className="font-medium text-foreground">Category</span>
                      <p className="text-muted-foreground">{venue.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-clock text-primary text-xl mr-3"></i>
                    <div>
                      <span className="font-medium text-foreground">Minimum Booking</span>
                      <p className="text-muted-foreground">{venue.minBookingMinutes || 30} minutes</p>
                    </div>
                  </div>
                  {venue.maxBookingMinutes && (
                    <div className="flex items-center">
                      <i className="fas fa-clock text-primary text-xl mr-3"></i>
                      <div>
                        <span className="font-medium text-foreground">Maximum Booking</span>
                        <p className="text-muted-foreground">{venue.maxBookingMinutes} minutes</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <i className="fas fa-map-marker-alt text-primary text-xl mr-3"></i>
                    <div>
                      <span className="font-medium text-foreground">Address</span>
                      <p className="text-muted-foreground">{venue.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-city text-primary text-xl mr-3"></i>
                    <div>
                      <span className="font-medium text-foreground">City</span>
                      <p className="text-muted-foreground">{venue.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-hourglass-half text-primary text-xl mr-3"></i>
                    <div>
                      <span className="font-medium text-foreground">Buffer Time</span>
                      <p className="text-muted-foreground">{venue.bufferMinutes || 30} minutes between bookings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Host Information */}
            {venue.host && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Host Information</h2>
                <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-2xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-primary text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {venue.host.firstName} {venue.host.lastName}
                    </h3>
                    <p className="text-muted-foreground">Host</p>
                  </div>
                </div>
              </div>
            )}

            {/* Availability Rules */}
            {venue.availabilityRules && venue.availabilityRules.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Availability Schedule</h2>
                <div className="space-y-2">
                  {venue.availabilityRules.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium text-foreground">
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][rule.dayOfWeek]}
                      </span>
                      <span className="text-muted-foreground">
                        {rule.openTime} - {rule.closeTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {venue.amenities && venue.amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {venue.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <i className="fas fa-check text-primary mr-3"></i>
                      <span className="text-foreground">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Packages */}
            {venue.packages && venue.packages.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Available Packages</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {venue.packages.map((pkg, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{pkg.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>
                        <div className="text-xl font-bold text-foreground">
                          ₪{pkg.priceEGP}
                          {pkg.durationMinutes && (
                            <span className="text-sm text-muted-foreground font-normal ml-1">
                              for {Math.floor(pkg.durationMinutes / 60)}h{pkg.durationMinutes % 60 > 0 ? ` ${pkg.durationMinutes % 60}m` : ''}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Location</h2>
              <MapView
                venues={[venue]}
                center={venue.lat && venue.lng ? { lat: parseFloat(venue.lat), lng: parseFloat(venue.lng) } : undefined}
                zoom={15}
                height="300px"
                className="rounded-2xl"
              />
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-foreground">₪{venue.baseHourlyPriceEGP}</div>
                  <div className="text-muted-foreground">per hour</div>
                  <div className="flex justify-center items-center mt-2 text-sm">
                    <i className="fas fa-clock text-primary mr-2"></i>
                    <span className="text-muted-foreground">
                      Minimum {venue.minBookingMinutes || 30} minutes
                    </span>
                  </div>
                </div>

                <Separator className="mb-6" />

                {/* Booking Form */}
                <div className="space-y-6">
                  <DateTimeRangePicker
                    onDateTimeChange={handleDateTimeChange}
                    minBookingMinutes={venue.minBookingMinutes || 30}
                    maxBookingMinutes={venue.maxBookingMinutes || undefined}
                  />

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Number of Guests
                    </label>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value))}
                      className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                      data-testid="guest-count-select"
                    >
                      {(() => {
                        const options = [];
                        const maxCapacity = venue.capacity;

                        // Generate ranges in 100 intervals
                        for (let i = 1; i <= maxCapacity; i += 100) {
                          const end = Math.min(i + 99, maxCapacity);
                          const range = i === end ? `${i}` : `${i}-${end}`;
                          options.push(
                            <option key={i} value={i}>
                              {range} {i === end ? 'guest' : 'guests'}
                            </option>
                          );
                        }

                        // If capacity is not a multiple of 100, add the remaining range
                        if (maxCapacity % 100 !== 0) {
                          const lastRangeStart = Math.floor(maxCapacity / 100) * 100 + 1;
                          if (lastRangeStart <= maxCapacity) {
                            options.push(
                              <option key={lastRangeStart} value={lastRangeStart}>
                                {lastRangeStart}-{maxCapacity} guests
                              </option>
                            );
                          }
                        }

                        return options;
                      })()}
                    </select>
                  </div>

                  {/* Availability Check */}
                  {startDateTime && (
                    <div className="text-sm">
                      {checkingAvailability ? (
                        <div className="flex items-center text-muted-foreground">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          Checking availability...
                        </div>
                      ) : availability?.available ? (
                        <div className="flex items-center text-accent">
                          <i className="fas fa-check-circle mr-2"></i>
                          Available for booking
                        </div>
                      ) : (
                        <div className="flex items-center text-destructive">
                          <i className="fas fa-times-circle mr-2"></i>
                          Not available
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                {startDateTime && (
                  <div className="border-t border-border mt-6 pt-6">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          ₪{venue.baseHourlyPriceEGP} × {Math.ceil(durationMinutes / 30) * 0.5} hours
                        </span>
                        <span className="text-foreground">₪{calculateTotalPrice()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-accent">
                        <span>No platform fees</span>
                        <span>₪0</span>
                      </div>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
                      <span>Total</span>
                      <span>₪{calculateTotalPrice()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Pay directly at the venue
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleBooking}
                  disabled={
                    !startDateTime ||
                    !availability?.available ||
                    checkingAvailability ||
                    bookingMutation.isPending
                  }
                  className="w-full mt-6"
                  data-testid="book-venue-button"
                >
                  {bookingMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Booking...
                    </>
                  ) : (
                    "Book Instantly"
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full mt-3"
                  data-testid="contact-host-button"
                >
                  Contact Host
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
