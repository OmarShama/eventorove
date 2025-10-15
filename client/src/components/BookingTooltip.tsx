import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Mail,
  Package,
  MessageSquare,
  Eye,
  Edit
} from 'lucide-react';
import { CalendarBooking } from './BookingCalendar';

interface BookingTooltipProps {
  booking: CalendarBooking;
  onView?: (booking: CalendarBooking) => void;
  onEdit?: (booking: CalendarBooking) => void;
  onContact?: (booking: CalendarBooking) => void;
}

export default function BookingTooltip({
  booking,
  onView,
  onEdit,
  onContact,
}: BookingTooltipProps) {
  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (startDateTime: string, endDateTime: string) => {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return diffMinutes > 0 ? `${diffHours}h ${diffMinutes}m` : `${diffHours}h`;
    }
    return `${diffMinutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500 hover:bg-green-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      case 'completed':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending Confirmation';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="w-80 shadow-lg border-2">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{booking.guestName}</h3>
            <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {getStatusLabel(booking.status)}
          </Badge>
        </div>

        {/* Date and Time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatDate(booking.startDateTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatTime(booking.startDateTime)} - {formatTime(booking.endDateTime)}
            </span>
            <span className="text-muted-foreground">
              ({formatDuration(booking.startDateTime, booking.endDateTime)})
            </span>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-2 py-2 border-t border-b">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-green-600">
              {formatPrice(booking.totalPriceEGP)} EGP
            </span>
          </div>

          {booking.venueName && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{booking.venueName}</span>
            </div>
          )}

          {booking.packageName && (
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>Package: {booking.packageName}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              NOTES
            </div>
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded text-wrap break-words">
              {booking.notes}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          {onView && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(booking)}
              className="flex-1"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          )}

          {onContact && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onContact(booking)}
              className="flex-1"
            >
              <Mail className="h-3 w-3 mr-1" />
              Contact
            </Button>
          )}

          {onEdit && booking.status !== 'completed' && booking.status !== 'cancelled' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(booking)}
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>

        {/* Booking ID */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Booking ID: {booking.id}
        </div>
      </CardContent>
    </Card>
  );
}
