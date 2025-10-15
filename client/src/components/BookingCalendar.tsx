import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  DollarSign,
  MapPin,
  Eye,
  Filter
} from 'lucide-react';

export interface CalendarBooking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestCount: number;
  startDateTime: string;
  endDateTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPriceEGP: number;
  venueName: string;
  packageName?: string;
  notes?: string;
}

interface BookingCalendarProps {
  bookings: CalendarBooking[];
  onBookingClick: (booking: CalendarBooking) => void;
  onDateSelect?: (date: Date) => void;
  selectedVenueId?: string;
  venues?: Array<{ id: string; name: string }>;
  onVenueChange?: (venueId: string | undefined) => void;
}

export default function BookingCalendar({
  bookings,
  onBookingClick,
  onDateSelect,
  selectedVenueId,
  venues = [],
  onVenueChange,
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1));
  };

  const formatDate = (day: number) => {
    return new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
  };

  const getBookingsForDate = (day: number): CalendarBooking[] => {
    const dateStr = formatDate(day);
    return bookings.filter(booking => {
      const bookingDate = booking.startDateTime.split('T')[0];
      return bookingDate === dateStr;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
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

  const handleDateClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Filter bookings by venue if selected
  const filteredBookings = selectedVenueId 
    ? bookings.filter(booking => booking.venueName === venues.find(v => v.id === selectedVenueId)?.name)
    : bookings;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Calendar
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Venue Filter */}
              {venues.length > 0 && onVenueChange && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedVenueId || 'all'} onValueChange={(value) => onVenueChange(value === 'all' ? undefined : value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All venues" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Venues</SelectItem>
                      {venues.map(venue => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Month Navigation */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-[150px] text-center">
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className="text-center font-medium text-sm text-gray-600 py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayBookings = getBookingsForDate(day);
              const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
              const isSelected = selectedDate && selectedDate.toDateString() === new Date(currentYear, currentMonth, day).toDateString();

              return (
                <div
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    aspect-square border rounded-lg cursor-pointer transition-all duration-200
                    hover:bg-gray-50 hover:border-gray-400
                    ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'border-gray-200'}
                    ${isToday ? 'bg-blue-100 border-blue-300' : ''}
                  `}
                >
                  <div className="p-1 h-full flex flex-col">
                    <div className={`text-sm ${isToday ? 'font-bold text-blue-800' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    
                    {/* Booking indicators */}
                    <div className="flex-1 overflow-hidden">
                      {dayBookings.slice(0, 3).map((booking) => (
                        <HoverCard key={booking.id}>
                          <HoverCardTrigger asChild>
                            <div
                              className={`
                                w-full h-1.5 rounded-sm mb-0.5 cursor-pointer
                                ${getStatusColor(booking.status)}
                              `}
                              onClick={(e) => {
                                e.stopPropagation();
                                onBookingClick(booking);
                              }}
                            />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{booking.guestName}</h4>
                                <Badge className={getStatusColor(booking.status)}>
                                  {getStatusLabel(booking.status)}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(booking.startDateTime)} - {formatTime(booking.endDateTime)}
                                  <span className="text-muted-foreground">
                                    ({formatDuration(booking.startDateTime, booking.endDateTime)})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-3 w-3" />
                                  {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-3 w-3" />
                                  {booking.totalPriceEGP} EGP
                                </div>
                                {booking.venueName && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    {booking.venueName}
                                  </div>
                                )}
                                {booking.packageName && (
                                  <div className="text-muted-foreground">
                                    Package: {booking.packageName}
                                  </div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onBookingClick(booking);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ))}
                      
                      {/* More indicator */}
                      {dayBookings.length > 3 && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          +{dayBookings.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Cancelled</span>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Total Bookings:</span>
                <p className="text-gray-600">{filteredBookings.length}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">This Month:</span>
                <p className="text-gray-600">
                  {filteredBookings.filter(b => {
                    const bookingDate = new Date(b.startDateTime);
                    return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
                  }).length}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Confirmed:</span>
                <p className="text-gray-600">
                  {filteredBookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Pending:</span>
                <p className="text-gray-600">
                  {filteredBookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
