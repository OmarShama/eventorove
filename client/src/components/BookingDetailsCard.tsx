import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BookingStatusBadge, { BookingStatus } from '@/components/BookingStatusBadge';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    DollarSign,
    CreditCard,
    User,
    Mail,
    Phone,
    Star,
    Wifi,
    Car,
    Coffee,
    Camera,
    Music,
    ExternalLink
} from 'lucide-react';

interface BookingDetailsCardProps {
    booking: {
        id: string;
        bookingNumber: string;
        status: BookingStatus;
        startTime: string;
        endTime: string;
        guestCount: number;
        totalCost: number;
        createdAt: string;
        specialRequests?: string;
        venue: {
            id: string;
            name: string;
            location: string;
            address?: string;
            imageUrl?: string;
            rating?: number;
            amenities?: string[];
            contact?: {
                email?: string;
                phone?: string;
            };
        };
        package?: {
            name: string;
            features: string[];
            price: number;
        };
        guest: {
            id: string;
            name: string;
            email: string;
            phone?: string;
        };
        payment?: {
            method: string;
            transactionId?: string;
            paidAt?: string;
            amount: number;
        };
    };
}

export default function BookingDetailsCard({ booking }: BookingDetailsCardProps) {
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            }),
        };
    };

    const getDuration = () => {
        const start = new Date(booking.startTime);
        const end = new Date(booking.endTime);
        const durationMs = end.getTime() - start.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours === 0) return `${minutes} minutes`;
        if (minutes === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        return `${hours}h ${minutes}m`;
    };

    const getAmenityIcon = (amenity: string) => {
        const icons: Record<string, React.ReactNode> = {
            'Wi-Fi': <Wifi className="h-4 w-4" />,
            'Parking': <Car className="h-4 w-4" />,
            'Catering': <Coffee className="h-4 w-4" />,
            'Photography': <Camera className="h-4 w-4" />,
            'Sound System': <Music className="h-4 w-4" />,
        };
        return icons[amenity] || <Star className="h-4 w-4" />;
    };

    const startDateTime = formatDateTime(booking.startTime);
    const endDateTime = formatDateTime(booking.endTime);

    return (
        <div className="space-y-6">
            {/* Main Booking Info */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl">Booking Details</CardTitle>
                            <p className="text-muted-foreground mt-1">#{booking.bookingNumber}</p>
                        </div>
                        <BookingStatusBadge status={booking.status} size="lg" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Venue Information */}
                    <div className="flex items-start space-x-4">
                        {booking.venue.imageUrl && (
                            <img
                                src={booking.venue.imageUrl}
                                alt={booking.venue.name}
                                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                            />
                        )}
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold">{booking.venue.name}</h3>
                                    <div className="flex items-center text-muted-foreground mt-1">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        <span>{booking.venue.location}</span>
                                    </div>
                                    {booking.venue.rating && (
                                        <div className="flex items-center mt-2">
                                            <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                                            <span className="text-sm font-medium">{booking.venue.rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                                <Link href={`/venue-detail?id=${booking.venue.id}`}>
                                    <Button variant="outline" size="sm">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Venue
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-b">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Event Date</p>
                                    <p className="text-sm text-muted-foreground">{startDateTime.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Time</p>
                                    <p className="text-sm text-muted-foreground">
                                        {startDateTime.time} - {endDateTime.time}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Guests</p>
                                    <p className="text-sm text-muted-foreground">{booking.guestCount} people</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Duration</p>
                                    <p className="text-sm text-muted-foreground">{getDuration()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Package Information */}
                    {booking.package && (
                        <div>
                            <h4 className="font-medium mb-3">Package Details</h4>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-blue-900">{booking.package.name}</h5>
                                    <span className="font-semibold text-blue-900">${booking.package.price}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {booking.package.features.map((feature, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            {feature}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Amenities */}
                    {booking.venue.amenities && booking.venue.amenities.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-3">Available Amenities</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {booking.venue.amenities.map((amenity, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <div className="text-green-600">
                                            {getAmenityIcon(amenity)}
                                        </div>
                                        <span className="text-sm">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Special Requests */}
                    {booking.specialRequests && (
                        <div>
                            <h4 className="font-medium mb-3">Special Requests</h4>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <p className="text-yellow-800">{booking.specialRequests}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Guest Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Guest Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{booking.guest.name}</p>
                                <p className="text-sm text-muted-foreground">Primary Contact</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{booking.guest.email}</p>
                                <p className="text-sm text-muted-foreground">Email Address</p>
                            </div>
                        </div>
                        {booking.guest.phone && (
                            <div className="flex items-center space-x-3">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">{booking.guest.phone}</p>
                                    <p className="text-sm text-muted-foreground">Phone Number</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Payment Information */}
            {booking.payment && (
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Payment Method</p>
                                            <p className="text-sm text-muted-foreground">{booking.payment.method}</p>
                                        </div>
                                    </div>
                                    {booking.payment.transactionId && (
                                        <div className="flex items-center space-x-3">
                                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">Transaction ID</p>
                                                <p className="text-sm text-muted-foreground font-mono">
                                                    {booking.payment.transactionId}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Total Amount:</span>
                                        <span className="text-2xl font-bold">${booking.totalCost}</span>
                                    </div>
                                    {booking.payment.paidAt && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Paid On:</span>
                                            <span className="font-medium">
                                                {formatDateTime(booking.payment.paidAt).date}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Venue Contact Information */}
            {booking.venue.contact && (
                <Card>
                    <CardHeader>
                        <CardTitle>Venue Contact</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {booking.venue.contact.email && (
                                <div className="flex items-center space-x-3">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{booking.venue.contact.email}</p>
                                        <p className="text-sm text-muted-foreground">Venue Email</p>
                                    </div>
                                </div>
                            )}
                            {booking.venue.contact.phone && (
                                <div className="flex items-center space-x-3">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{booking.venue.contact.phone}</p>
                                        <p className="text-sm text-muted-foreground">Venue Phone</p>
                                    </div>
                                </div>
                            )}
                            {booking.venue.address && (
                                <div className="flex items-center space-x-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{booking.venue.address}</p>
                                        <p className="text-sm text-muted-foreground">Full Address</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
