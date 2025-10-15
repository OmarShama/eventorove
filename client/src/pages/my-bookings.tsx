import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { bookingApi } from '@/lib/api';
// Layout is now handled globally in _app.tsx
import BookingCard from '@/components/BookingCard';
import BookingFilters, { BookingFilters as BookingFiltersType } from '@/components/BookingFilters';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Calendar,
    Plus,
    AlertCircle,
    Search
} from 'lucide-react';
import { BookingStatus } from '@/components/BookingStatusBadge';

// Mock booking data for development
const mockBookings = [
    {
        id: '1',
        venue: {
            id: 'venue-1',
            name: 'Grand Conference Hall',
            location: 'Downtown Business District',
            imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
        },
        startTime: '2024-02-15T14:00:00Z',
        endTime: '2024-02-15T18:00:00Z',
        guestCount: 50,
        totalCost: 1200,
        status: 'confirmed' as BookingStatus,
        bookingNumber: 'BK-2024-001',
        createdAt: '2024-01-20T10:00:00Z',
        specialRequests: 'Need projector and sound system setup',
        package: {
            name: 'Corporate Event Package',
            features: ['A/V Equipment', 'Catering Setup', 'Parking', 'Security'],
        },
    },
    {
        id: '2',
        venue: {
            id: 'venue-2',
            name: 'Riverside Garden Venue',
            location: 'Waterfront District',
            imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop',
        },
        startTime: '2024-03-22T16:00:00Z',
        endTime: '2024-03-22T22:00:00Z',
        guestCount: 75,
        totalCost: 2500,
        status: 'pending' as BookingStatus,
        bookingNumber: 'BK-2024-002',
        createdAt: '2024-02-01T15:30:00Z',
        package: {
            name: 'Wedding Reception Package',
            features: ['Floral Arrangements', 'Photography Area', 'Dance Floor', 'Catering Kitchen'],
        },
    },
    {
        id: '3',
        venue: {
            id: 'venue-3',
            name: 'Modern Art Gallery',
            location: 'Arts District',
            imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        },
        startTime: '2024-01-10T19:00:00Z',
        endTime: '2024-01-10T23:00:00Z',
        guestCount: 30,
        totalCost: 800,
        status: 'completed' as BookingStatus,
        bookingNumber: 'BK-2024-003',
        createdAt: '2023-12-15T09:00:00Z',
        specialRequests: 'Climate control important for artwork displays',
    },
];

export default function MyBookings() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [filters, setFilters] = useState<BookingFiltersType>({
        sortBy: 'date',
        sortOrder: 'desc',
    });

    // Fetch bookings
    const { data: bookingsData, isLoading, error } = useQuery({
        queryKey: ['bookings', 'me'],
        queryFn: bookingApi.getMyBookings,
        enabled: isAuthenticated,
        // Use mock data for development
        initialData: { success: true, data: mockBookings },
    });

    const bookings = (bookingsData as any)?.data || mockBookings;

    // Cancel booking mutation
    // const cancelBookingMutation = useMutation({
    //     mutationFn: async (bookingId: string) => {
    //         // TODO: Implement cancel booking API call
    //         // return bookingApi.cancelBooking(bookingId);
    //         throw new Error('Cancel booking API not implemented yet');
    //     },
    //     onSuccess: () => {
    //         toast({
    //             title: 'Booking Cancelled',
    //             description: 'Your booking has been successfully cancelled.',
    //         });
    //         queryClient.invalidateQueries({ queryKey: ['bookings'] });
    //     },
    //     onError: (error) => {
    //         toast({
    //             title: 'Error',
    //             description: error.message || 'Failed to cancel booking',
    //             variant: 'destructive',
    //         });
    //     },
    // });

    // Filter and sort bookings
    const filteredBookings = useMemo(() => {
        let filtered = [...bookings];

        // Apply search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(
                booking =>
                    booking.venue.name.toLowerCase().includes(searchTerm) ||
                    booking.venue.location.toLowerCase().includes(searchTerm) ||
                    booking.bookingNumber.toLowerCase().includes(searchTerm)
            );
        }

        // Apply status filter
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(booking => booking.status === filters.status);
        }

        // Apply date range filter
        if (filters.dateRange?.from) {
            filtered = filtered.filter(
                booking => new Date(booking.startTime) >= filters.dateRange!.from!
            );
        }
        if (filters.dateRange?.to) {
            filtered = filtered.filter(
                booking => new Date(booking.startTime) <= filters.dateRange!.to!
            );
        }

        // Apply venue filter
        if (filters.venue) {
            filtered = filtered.filter(booking => booking.venue.id === filters.venue);
        }

        // Apply quick filters
        if (filters.showUpcoming) {
            filtered = filtered.filter(booking => new Date(booking.startTime) > new Date());
        }
        if (filters.showPast) {
            filtered = filtered.filter(booking => new Date(booking.startTime) < new Date());
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (filters.sortBy) {
                case 'date':
                    aValue = new Date(a.startTime);
                    bValue = new Date(b.startTime);
                    break;
                case 'created':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                case 'cost':
                    aValue = a.totalCost;
                    bValue = b.totalCost;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    aValue = new Date(a.startTime);
                    bValue = new Date(b.startTime);
            }

            if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [bookings, filters]);

    // Get unique venues for filter options
    const venueOptions = useMemo(() => {
        const uniqueVenues = bookings.reduce((acc: any, booking: any) => {
            if (!acc.find((v: any) => v.id === booking.venue.id)) {
                acc.push({ id: booking.venue.id, name: booking.venue.name });
            }
            return acc;
        }, [] as Array<{ id: string; name: string }>);
        return uniqueVenues;
    }, [bookings]);

    const handleCancelBooking = async () => {
        // Refresh the bookings list after successful cancellation
        queryClient.invalidateQueries({ queryKey: ['bookings', 'me'] });
    };

    const handleViewDetails = (bookingId: string) => {
        router.push(`/booking-details/${bookingId}`);
    };

    // Show loading state
    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-lg text-muted-foreground">Loading your bookings...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Bookings</h2>
                    <p className="text-muted-foreground mb-4">
                        We couldn&apos;t load your bookings. Please try again.
                    </p>
                    <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['bookings'] })}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <Calendar className="mr-3 h-8 w-8" />
                                My Bookings
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Manage and track all your venue bookings
                            </p>
                        </div>
                        <Button onClick={() => router.push('/search')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Book New Venue
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <BookingFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        venueOptions={venueOptions}
                        totalBookings={bookings.length}
                        filteredCount={filteredBookings.length}
                    />
                </div>

                {/* Bookings List */}
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-12">
                        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {bookings.length === 0 ? 'No Bookings Yet' : 'No Matching Bookings'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {bookings.length === 0
                                ? "You haven't made any bookings yet. Start by exploring venues."
                                : 'Try adjusting your filters to see more results.'}
                        </p>
                        {bookings.length === 0 ? (
                            <Button onClick={() => router.push('/search')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Browse Venues
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => setFilters({ sortBy: 'date', sortOrder: 'desc' })}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredBookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onCancel={handleCancelBooking}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
