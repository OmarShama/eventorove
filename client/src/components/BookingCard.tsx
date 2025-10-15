import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BookingStatusBadge, { BookingStatus } from '@/components/BookingStatusBadge';
import CancelBookingDialog from '@/components/CancelBookingDialog';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    DollarSign,
    Eye,
    MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Booking {
    id: string;
    venue: {
        id: string;
        name: string;
        location: string;
        imageUrl?: string;
    };
    startTime: string;
    endTime: string;
    guestCount: number;
    totalCost: number;
    status: BookingStatus;
    bookingNumber: string;
    createdAt: string;
    specialRequests?: string;
    package?: {
        name: string;
        features: string[];
    };
}

interface BookingCardProps {
    booking: Booking;
    onCancel?: (id: string) => void;
    onViewDetails?: (id: string) => void;
    showVenueInfo?: boolean;
}

export default function BookingCard({
    booking,
    onCancel,
    onViewDetails,
    showVenueInfo = true
}: BookingCardProps) {

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const getDuration = () => {
        const start = new Date(booking.startTime);
        const end = new Date(booking.endTime);
        const durationMs = end.getTime() - start.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours === 0) return `${minutes}m`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}m`;
    };

    const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
    const isUpcoming = new Date(booking.startTime) > new Date();


    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                            <BookingStatusBadge status={booking.status} />
                            <span className="text-sm text-muted-foreground">
                                #{booking.bookingNumber}
                            </span>
                        </div>
                        {showVenueInfo && (
                            <h3 className="text-lg font-semibold mb-1">{booking.venue.name}</h3>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDetails?.(booking.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/venue-detail?id=${booking.venue.id}`}>
                                    <MapPin className="mr-2 h-4 w-4" />
                                    View Venue
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Venue Image and Location */}
                {showVenueInfo && (
                    <div className="flex items-center space-x-3">
                        {booking.venue.imageUrl && (
                            <img
                                src={booking.venue.imageUrl}
                                alt={booking.venue.name}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                        )}
                        <div className="flex-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 mr-1" />
                                {booking.venue.location}
                            </div>
                        </div>
                    </div>
                )}

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">{formatDate(booking.startTime)}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">{getDuration()}</p>
                            <p className="text-xs text-muted-foreground">Duration</p>
                        </div>
                    </div>
                </div>

                {/* Guest Count and Cost */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">{booking.guestCount} guests</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">${booking.totalCost}</p>
                            <p className="text-xs text-muted-foreground">Total cost</p>
                        </div>
                    </div>
                </div>

                {/* Package Info */}
                {booking.package && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                            Package: {booking.package.name}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {booking.package.features.slice(0, 3).map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {feature}
                                </Badge>
                            ))}
                            {booking.package.features.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{booking.package.features.length - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* Special Requests */}
                {booking.specialRequests && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-yellow-900 mb-1">Special Requests:</p>
                        <p className="text-sm text-yellow-800">{booking.specialRequests}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails?.(booking.id)}
                        className="flex-1"
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </Button>
                    {canCancel && isUpcoming && (
                        <CancelBookingDialog
                            bookingId={booking.id}
                            bookingNumber={booking.bookingNumber}
                            startTime={booking.startTime}
                            totalCost={booking.totalCost}
                            onCancel={() => onCancel?.(booking.id)}
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                            >
                                Cancel
                            </Button>
                        </CancelBookingDialog>
                    )}
                </div>

                {/* Booking Date */}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                </div>
            </CardContent>
        </Card>
    );
}
