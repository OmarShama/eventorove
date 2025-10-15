import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar as CalendarIcon, List, BarChart3 } from 'lucide-react';

// Import our components
import BookingCalendar, { CalendarBooking } from '@/components/BookingCalendar';
import CalendarFilters, { CalendarFilters as CalendarFiltersType } from '@/components/CalendarFilters';

// Mock data - replace with actual API calls
const mockBookings: CalendarBooking[] = [
  {
    id: 'booking-1',
    guestName: 'John Smith',
    guestEmail: 'john.smith@email.com',
    guestCount: 12,
    startDateTime: '2024-01-15T09:00:00Z',
    endDateTime: '2024-01-15T12:00:00Z',
    status: 'confirmed',
    totalPriceEGP: 1500,
    venueName: 'Executive Conference Room',
    packageName: 'Standard Meeting Package',
    notes: 'Need AV equipment for presentation. Client meeting with board of directors.',
  },
  {
    id: 'booking-2',
    guestName: 'Sarah Johnson',
    guestEmail: 'sarah.j@company.com',
    guestCount: 8,
    startDateTime: '2024-01-15T14:00:00Z',
    endDateTime: '2024-01-15T16:30:00Z',
    status: 'pending',
    totalPriceEGP: 800,
    venueName: 'Creative Studio A',
    packageName: 'Workshop Package',
    notes: 'Team building workshop. Need flexible seating arrangement.',
  },
  {
    id: 'booking-3',
    guestName: 'Michael Brown',
    guestEmail: 'mike.brown@startup.io',
    guestCount: 25,
    startDateTime: '2024-01-16T10:00:00Z',
    endDateTime: '2024-01-16T15:00:00Z',
    status: 'confirmed',
    totalPriceEGP: 2500,
    venueName: 'Main Event Hall',
    packageName: 'Premium Event Package',
    notes: 'Product launch event. Requires full AV setup and catering.',
  },
  {
    id: 'booking-4',
    guestName: 'Emily Davis',
    guestEmail: 'emily.davis@consulting.com',
    guestCount: 6,
    startDateTime: '2024-01-17T13:00:00Z',
    endDateTime: '2024-01-17T17:00:00Z',
    status: 'completed',
    totalPriceEGP: 1200,
    venueName: 'Executive Conference Room',
    packageName: 'Standard Meeting Package',
  },
  {
    id: 'booking-5',
    guestName: 'Robert Wilson',
    guestEmail: 'r.wilson@agency.com',
    guestCount: 15,
    startDateTime: '2024-01-18T09:30:00Z',
    endDateTime: '2024-01-18T12:30:00Z',
    status: 'cancelled',
    totalPriceEGP: 900,
    venueName: 'Creative Studio B',
    notes: 'Cancelled due to schedule conflict.',
  },
  {
    id: 'booking-6',
    guestName: 'Lisa Anderson',
    guestEmail: 'lisa.a@nonprofit.org',
    guestCount: 20,
    startDateTime: '2024-01-20T11:00:00Z',
    endDateTime: '2024-01-20T16:00:00Z',
    status: 'confirmed',
    totalPriceEGP: 1800,
    venueName: 'Main Event Hall',
    packageName: 'Premium Event Package',
    notes: 'Charity fundraising event. Need space for networking and presentations.',
  },
];

const mockVenues = [
  { id: 'venue-1', name: 'Executive Conference Room' },
  { id: 'venue-2', name: 'Creative Studio A' },
  { id: 'venue-3', name: 'Creative Studio B' },
  { id: 'venue-4', name: 'Main Event Hall' },
];

export default function HostCalendar() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [filters, setFilters] = useState<CalendarFiltersType>({});

  // Redirect if not authenticated or not a host
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'host' && user?.role !== 'admin'))) {
      toast({
        title: "Access Denied",
        description: "You need to be a host to access this page.",
        variant: "destructive",
      });
      router.push('/');
    }
  }, [authLoading, isAuthenticated, user, toast, router]);

  // Mock data queries - replace with actual API calls
  const { data: bookings = mockBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['host-bookings', filters],
    queryFn: () => {
      // Simulate API delay
      return new Promise<CalendarBooking[]>(resolve => {
        setTimeout(() => resolve(mockBookings), 500);
      });
    },
    enabled: isAuthenticated,
  });

  const { data: venues = mockVenues } = useQuery({
    queryKey: ['host-venues'],
    queryFn: () => Promise.resolve(mockVenues),
    enabled: isAuthenticated,
  });

  // Filter bookings based on current filters
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!booking.guestName.toLowerCase().includes(searchLower) &&
          !booking.guestEmail.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (filters.status && filters.status !== 'all' && booking.status !== filters.status) {
        return false;
      }

      // Venue filter
      if (filters.venueId) {
        const venueMatch = venues.find(v => v.id === filters.venueId);
        if (venueMatch && booking.venueName !== venueMatch.name) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange?.start || filters.dateRange?.end) {
        const bookingDate = booking.startDateTime.split('T')[0];
        if (filters.dateRange.start && bookingDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && bookingDate > filters.dateRange.end) {
          return false;
        }
      }

      // Guest count filter
      if (filters.guestCountRange?.min && booking.guestCount < filters.guestCountRange.min) {
        return false;
      }
      if (filters.guestCountRange?.max && booking.guestCount > filters.guestCountRange.max) {
        return false;
      }

      // Price range filter
      if (filters.priceRange?.min && booking.totalPriceEGP < filters.priceRange.min) {
        return false;
      }
      if (filters.priceRange?.max && booking.totalPriceEGP > filters.priceRange.max) {
        return false;
      }

      return true;
    });
  }, [bookings, filters, venues]);

  // Handler functions
  const handleBookingClick = (booking: CalendarBooking) => {
    router.push(`/booking-details/${booking.id}`);
  };

  const handleDateSelect = (date: Date) => {
    // Could open a modal to create new booking or show availability
    console.log('Date selected:', date);
  };

  const handleFiltersChange = (newFilters: CalendarFiltersType) => {
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({});
  };

  const handleVenueChange = (venueId: string | undefined) => {
    setFilters({ ...filters, venueId });
  };

  // Calculate summary statistics
  const stats = useMemo(() => {
    const total = filteredBookings.length;
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed').length;
    const pending = filteredBookings.filter(b => b.status === 'pending').length;
    const cancelled = filteredBookings.filter(b => b.status === 'cancelled').length;
    const completed = filteredBookings.filter(b => b.status === 'completed').length;
    const revenue = filteredBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.totalPriceEGP, 0);

    return { total, confirmed, pending, cancelled, completed, revenue };
  }, [filteredBookings]);

  if (authLoading || bookingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'host' && user?.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/host/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Calendar</h1>
              <p className="text-gray-600 mt-2">
                View and manage your venue bookings in calendar format
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <CalendarFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          venues={venues}
          onReset={resetFilters}
        />

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <BookingCalendar
              bookings={filteredBookings}
              onBookingClick={handleBookingClick}
              onDateSelect={handleDateSelect}
              selectedVenueId={filters.venueId}
              venues={venues}
              onVenueChange={handleVenueChange}
            />
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            {/* List View Implementation */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Booking List</h3>
              <div className="space-y-3">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No bookings found for the selected filters</p>
                  </div>
                ) : (
                  filteredBookings.map(booking => (
                    <div
                      key={booking.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleBookingClick(booking)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{booking.guestName}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.startDateTime).toLocaleDateString()} •
                            {new Date(booking.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                            {new Date(booking.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-sm text-gray-500">{booking.venueName}</p>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                            {booking.status}
                          </div>
                          <p className="text-sm font-semibold mt-1">{booking.totalPriceEGP} EGP</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            {/* Statistics View */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Total Bookings</h3>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-sm text-gray-600 mt-2">
                  {((stats.confirmed + stats.completed) / stats.total * 100 || 0).toFixed(1)}% success rate
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Revenue</h3>
                <div className="text-3xl font-bold text-green-600">{stats.revenue.toLocaleString()} EGP</div>
                <p className="text-sm text-gray-600 mt-2">
                  From {stats.confirmed + stats.completed} confirmed bookings
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Average Booking</h3>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.total > 0 ? Math.round(stats.revenue / (stats.confirmed + stats.completed) || 0).toLocaleString() : 0} EGP
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Per confirmed booking
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Confirmed</h3>
                <div className="text-3xl font-bold text-green-600">{stats.confirmed}</div>
                <p className="text-sm text-gray-600 mt-2">Ready to proceed</p>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Pending</h3>
                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-sm text-gray-600 mt-2">Awaiting confirmation</p>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Completed</h3>
                <div className="text-3xl font-bold text-blue-600">{stats.completed}</div>
                <p className="text-sm text-gray-600 mt-2">Successfully finished</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
