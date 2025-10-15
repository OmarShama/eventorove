import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  X,
} from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBlocked: boolean;
  reason?: string;
}

interface DayAvailability {
  date: string;
  timeSlots: TimeSlot[];
  isBlackout: boolean;
  blackoutReason?: string;
}

interface AvailabilityCalendarProps {
  venueId: string;
  availability: DayAvailability[];
  onAddTimeSlot: (date: string) => void;
  onRemoveTimeSlot: (date: string, slotId: string) => void;
  onToggleBlackout: (date: string) => void;
}

export default function AvailabilityCalendar({
  venueId,
  availability,
  onAddTimeSlot,
  onRemoveTimeSlot,
  onToggleBlackout,
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // TODO: Use venueId for API calls to fetch/update availability
  console.debug('Managing availability for venue:', venueId);

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

  const getDayAvailability = (day: number): DayAvailability | undefined => {
    const dateStr = formatDate(day);
    return availability.find(a => a.date === dateStr);
  };

  const getDayStatus = (day: number) => {
    const dayAvail = getDayAvailability(day);
    if (!dayAvail) return { color: 'bg-gray-100', label: 'No rules' };

    if (dayAvail.isBlackout) return { color: 'bg-red-100 border-red-300', label: 'Blocked' };

    const availableSlots = dayAvail.timeSlots.filter(slot => !slot.isBlocked).length;
    if (availableSlots === 0) return { color: 'bg-orange-100 border-orange-300', label: 'No availability' };
    if (availableSlots < dayAvail.timeSlots.length) return { color: 'bg-yellow-100 border-yellow-300', label: 'Partial availability' };

    return { color: 'bg-green-100 border-green-300', label: 'Available' };
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Availability Calendar
            </CardTitle>
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

              const dateStr = formatDate(day);
              const dayStatus = getDayStatus(day);
              const isSelected = selectedDate === dateStr;
              const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`
                    aspect-square border-2 rounded-lg cursor-pointer transition-all duration-200
                    flex flex-col items-center justify-center text-sm
                    ${dayStatus.color}
                    ${isSelected ? 'ring-2 ring-blue-500' : ''}
                    ${isToday ? 'font-bold' : ''}
                  `}
                >
                  <span>{day}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
              <span>No slots</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span>Blocked</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
              <span>No rules</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleBlackout(selectedDate)}
                >
                  {getDayAvailability(new Date(selectedDate).getDate())?.isBlackout ? 'Remove Blackout' : 'Add Blackout'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddTimeSlot(selectedDate)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Time Slot
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const dayNum = new Date(selectedDate).getDate();
              const dayAvail = getDayAvailability(dayNum);

              if (!dayAvail) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No availability rules set for this day</p>
                    <p className="text-sm">Click &quot;Add Time Slot&quot; to get started</p>
                  </div>
                );
              }

              if (dayAvail.isBlackout) {
                return (
                  <div className="text-center py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <X className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <h4 className="font-medium text-red-900 mb-1">Day Blocked</h4>
                      <p className="text-sm text-red-700">
                        {dayAvail.blackoutReason || 'This day is unavailable for bookings'}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {dayAvail.timeSlots.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p>No time slots configured</p>
                    </div>
                  ) : (
                    dayAvail.timeSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`
                          flex items-center justify-between p-3 rounded-lg border
                          ${slot.isBlocked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <Clock className={`h-4 w-4 ${slot.isBlocked ? 'text-red-500' : 'text-green-500'}`} />
                          <span className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          {slot.isBlocked && (
                            <Badge variant="destructive" className="text-xs">
                              Blocked
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveTimeSlot(selectedDate, slot.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
