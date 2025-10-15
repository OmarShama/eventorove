import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BookingStatus } from '@/components/BookingStatusBadge';
import {
    Calendar,
    Phone,
    Mail,
    MapPin,
    Download,
    Share2,
    Edit,
    AlertTriangle,
    Clock
} from 'lucide-react';

interface BookingActionsProps {
    bookingId: string;
    status: BookingStatus;
    startTime: string;
    endTime: string;
    venueContact?: {
        email?: string;
        phone?: string;
        address?: string;
    };
    onCancel?: () => void;
    onModify?: () => void;
    onContactVenue?: () => void;
}

export default function BookingActions({
    bookingId,
    status,
    startTime,
    endTime,
    venueContact,
    onCancel,
    onModify,
    onContactVenue,
}: BookingActionsProps) {
    const { toast } = useToast();
    const [isLoading] = useState<string | null>(null);

    const isUpcoming = new Date(startTime) > new Date();
    const isInProgress = new Date() >= new Date(startTime) && new Date() <= new Date(endTime);
    const canCancel = (status === 'confirmed' || status === 'pending') && isUpcoming;
    const canModify = (status === 'confirmed' || status === 'pending') && isUpcoming;

    const handleAddToCalendar = () => {
        const start = new Date(startTime);
        const end = new Date(endTime);

        // Create calendar event URL (Google Calendar format)
        const startDate = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${startDate}%2F${endDate}&text=Venue%20Booking%20%23${bookingId}&details=Booking%20confirmation%20for%20venue%20event`;

        window.open(calendarUrl, '_blank');

        toast({
            title: 'Calendar Event',
            description: 'Opening calendar to add this booking',
        });
    };

    const handleDownloadConfirmation = () => {
        // Mock download functionality
        toast({
            title: 'Download Started',
            description: 'Your booking confirmation is being downloaded',
        });

        // In a real implementation, this would generate and download a PDF
        console.log(`Downloading confirmation for booking ${bookingId}`);
    };

    const handleShareBooking = async () => {
        const shareData = {
            title: `Booking Confirmation #${bookingId}`,
            text: `Check out my venue booking details`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast({
                    title: 'Booking Shared',
                    description: 'Booking details have been shared successfully',
                });
            } catch (error) {
                // User cancelled sharing
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                toast({
                    title: 'Link Copied',
                    description: 'Booking link has been copied to clipboard',
                });
            } catch (error) {
                toast({
                    title: 'Share Failed',
                    description: 'Unable to share booking details',
                    variant: 'destructive',
                });
            }
        }
    };

    const handleContactVenue = (method: 'email' | 'phone') => {
        if (method === 'email' && venueContact?.email) {
            const subject = encodeURIComponent(`Booking Inquiry #${bookingId}`);
            const body = encodeURIComponent(`Hi,\n\nI have a question regarding my booking #${bookingId}.\n\nThank you!`);
            window.open(`mailto:${venueContact.email}?subject=${subject}&body=${body}`);
        } else if (method === 'phone' && venueContact?.phone) {
            window.open(`tel:${venueContact.phone}`);
        } else {
            onContactVenue?.();
        }

        toast({
            title: 'Contacting Venue',
            description: `Opening ${method} to contact the venue`,
        });
    };

    const getTimeStatus = () => {
        if (isInProgress) {
            return {
                label: 'Event in Progress',
                color: 'text-blue-600',
                icon: <Clock className="h-4 w-4" />,
                bg: 'bg-blue-50'
            };
        } else if (isUpcoming) {
            const hoursUntil = Math.ceil((new Date(startTime).getTime() - new Date().getTime()) / (1000 * 60 * 60));
            return {
                label: `Starts in ${hoursUntil < 24 ? `${hoursUntil} hours` : `${Math.ceil(hoursUntil / 24)} days`}`,
                color: 'text-green-600',
                icon: <Calendar className="h-4 w-4" />,
                bg: 'bg-green-50'
            };
        } else {
            return {
                label: 'Event Completed',
                color: 'text-gray-600',
                icon: <Calendar className="h-4 w-4" />,
                bg: 'bg-gray-50'
            };
        }
    };

    const timeStatus = getTimeStatus();

    return (
        <div className="space-y-4">
            {/* Time Status Card */}
            <Card className={timeStatus.bg}>
                <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                        <div className={timeStatus.color}>
                            {timeStatus.icon}
                        </div>
                        <span className={`font-medium ${timeStatus.color}`}>
                            {timeStatus.label}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Primary Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Calendar and Download */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={handleAddToCalendar}
                            className="flex items-center justify-center space-x-2"
                        >
                            <Calendar className="h-4 w-4" />
                            <span>Add to Calendar</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleDownloadConfirmation}
                            className="flex items-center justify-center space-x-2"
                        >
                            <Download className="h-4 w-4" />
                            <span>Download PDF</span>
                        </Button>
                    </div>

                    {/* Share */}
                    <Button
                        variant="outline"
                        onClick={handleShareBooking}
                        className="w-full flex items-center justify-center space-x-2"
                    >
                        <Share2 className="h-4 w-4" />
                        <span>Share Booking</span>
                    </Button>
                </CardContent>
            </Card>

            {/* Contact Venue */}
            {venueContact && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Contact Venue</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {venueContact.email && (
                            <Button
                                variant="outline"
                                onClick={() => handleContactVenue('email')}
                                className="w-full flex items-center justify-center space-x-2"
                            >
                                <Mail className="h-4 w-4" />
                                <span>Send Email</span>
                            </Button>
                        )}
                        {venueContact.phone && (
                            <Button
                                variant="outline"
                                onClick={() => handleContactVenue('phone')}
                                className="w-full flex items-center justify-center space-x-2"
                            >
                                <Phone className="h-4 w-4" />
                                <span>Call Venue</span>
                            </Button>
                        )}
                        {venueContact.address && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(venueContact.address!)}`;
                                    window.open(mapsUrl, '_blank');
                                }}
                                className="w-full flex items-center justify-center space-x-2"
                            >
                                <MapPin className="h-4 w-4" />
                                <span>View Directions</span>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Booking Management */}
            {(canModify || canCancel) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Manage Booking</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {canModify && (
                            <Button
                                variant="outline"
                                onClick={onModify}
                                disabled={isLoading === 'modify'}
                                className="w-full flex items-center justify-center space-x-2"
                            >
                                <Edit className="h-4 w-4" />
                                <span>Modify Booking</span>
                            </Button>
                        )}
                        {canCancel && (
                            <Button
                                variant="destructive"
                                onClick={onCancel}
                                disabled={isLoading === 'cancel'}
                                className="w-full flex items-center justify-center space-x-2"
                            >
                                <AlertTriangle className="h-4 w-4" />
                                <span>Cancel Booking</span>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Status-based Messages */}
            {status === 'pending' && (
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-6">
                        <div className="flex items-start space-x-3">
                            <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-yellow-900">Awaiting Confirmation</h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Your booking is pending confirmation from the venue. You&apos;ll receive an email once it&apos;s confirmed.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {status === 'payment_pending' && (
                <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="pt-6">
                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-orange-900">Payment Required</h4>
                                <p className="text-sm text-orange-700 mt-1">
                                    Complete your payment to confirm this booking. The venue is holding your reservation temporarily.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
