import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { bookingApi } from '@/lib/api';
import BookingDetailsCard from '@/components/BookingDetailsCard';
import BookingActions from '@/components/BookingActions';
import BookingTimeline from '@/components/BookingTimeline';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { BookingStatus } from '@/components/BookingStatusBadge';

// Mock booking data for development
const generateMockBooking = (id: string) => ({
    id,
    bookingNumber: `BK-2024-${id.padStart(3, '0')}`,
    status: 'confirmed' as BookingStatus,
    startTime: '2024-02-15T14:00:00Z',
    endTime: '2024-02-15T18:00:00Z',
    guestCount: 50,
    totalCost: 1200,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-21T15:30:00Z',
    specialRequests: 'Need projector and sound system setup, dietary requirements for catering',
    venue: {
        id: 'venue-1',
        name: 'Grand Conference Hall',
        location: 'Downtown Business District',
        address: '123 Business Ave, Downtown, City 12345',
        imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
        rating: 4.8,
        amenities: ['Wi-Fi', 'Parking', 'Catering', 'Photography', 'Sound System', 'Air Conditioning'],
        contact: {
            email: 'contact@grandconferencehall.com',
            phone: '+1 (555) 123-4567',
        },
    },
    package: {
        name: 'Corporate Event Package',
        features: ['A/V Equipment', 'Catering Setup', 'Parking', 'Security', 'Event Coordinator'],
        price: 800,
    },
    guest: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@company.com',
        phone: '+1 (555) 987-6543',
    },
    payment: {
        method: 'Credit Card (**** 4567)',
        transactionId: 'TXN-20240120-ABC123',
        paidAt: '2024-01-20T15:30:00Z',
        amount: 1200,
    },
});

export default function BookingDetails() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { id } = router.query;

    // Fetch booking details
    const {
        data: bookingData,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['booking', id],
        queryFn: () => bookingApi.getById(id as string),
        enabled: !!id && isAuthenticated,
        // Use mock data for development
        initialData: id ? { success: true, data: generateMockBooking(id as string) } : undefined,
    });

    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
        router.push('/login');
        return null;
    }

    const booking = (bookingData as any)?.data;

    const handleCancelBooking = () => {
        // TODO: Implement cancel booking functionality
        toast({
            title: 'Cancellation Request',
            description: 'Please contact support to cancel your booking.',
        });
    };

    const handleModifyBooking = () => {
        // TODO: Implement modify booking functionality
        toast({
            title: 'Modification Request',
            description: 'Please contact support to modify your booking.',
        });
    };

    const handleContactVenue = () => {
        if (booking?.venue.contact?.email) {
            const subject = encodeURIComponent(`Booking Inquiry #${booking.bookingNumber}`);
            const body = encodeURIComponent(`Hi,\n\nI have a question regarding my booking #${booking.bookingNumber}.\n\nThank you!`);
            window.open(`mailto:${booking.venue.contact.email}?subject=${subject}&body=${body}`);
        } else {
            toast({
                title: 'Contact Information',
                description: 'Venue contact information will be available once booking is confirmed.',
            });
        }
    };

    // Show loading state
    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-lg text-muted-foreground">Loading booking details...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error || !booking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
                    <p className="text-muted-foreground mb-6">
                        We couldn&apos;t find the booking you&apos;re looking for. It may have been moved or deleted.
                    </p>
                    <div className="space-y-3">
                        <Button onClick={() => refetch()} className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/my-bookings')}
                            className="w-full"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to My Bookings
                        </Button>
                    </div>
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
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Booking Details
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Complete information about your venue reservation
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Booking Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <BookingDetailsCard booking={booking} />

                        {/* Timeline */}
                        <BookingTimeline
                            bookingId={booking.id}
                            status={booking.status}
                            createdAt={booking.createdAt}
                            updatedAt={booking.updatedAt}
                        />
                    </div>

                    {/* Sidebar - Actions */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <BookingActions
                                bookingId={booking.id}
                                status={booking.status}
                                startTime={booking.startTime}
                                endTime={booking.endTime}
                                venueContact={booking.venue.contact}
                                onCancel={handleCancelBooking}
                                onModify={handleModifyBooking}
                                onContactVenue={handleContactVenue}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
