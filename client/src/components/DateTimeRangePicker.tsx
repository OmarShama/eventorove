import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatInTimeZone } from "date-fns-tz";
import { addMinutes } from "date-fns";

interface DateTimeRangePickerProps {
  onDateTimeChange: (startDateTime: Date, endDateTime: Date, durationMinutes: number) => void;
  minBookingMinutes?: number;
  maxBookingMinutes?: number;
  className?: string;
  disabled?: boolean;
}

const CAIRO_TIMEZONE = "Africa/Cairo";

export default function DateTimeRangePicker({
  onDateTimeChange,
  minBookingMinutes = 30,
  maxBookingMinutes,
  className = "",
  disabled = false,
}: DateTimeRangePickerProps) {
  const [startDateTime, setStartDateTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(minBookingMinutes);

  // Generate duration options
  const getDurationOptions = () => {
    const options = [];
    let current = minBookingMinutes;

    // Add 30-minute increments up to 4 hours
    while (current <= 240) {
      const hours = Math.floor(current / 60);
      const mins = current % 60;
      const label = hours > 0
        ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
        : `${mins} minutes`;

      options.push({ value: current, label });
      current += 30;
    }

    // Add longer durations
    const longerDurations = [300, 360, 420, 480, 600, 720];
    longerDurations.forEach(duration => {
      if (!maxBookingMinutes || duration <= maxBookingMinutes) {
        const hours = duration / 60;
        options.push({ value: duration, label: `${hours} hours` });
      }
    });

    return options;
  };

  useEffect(() => {
    if (startDateTime) {
      const start = new Date(startDateTime);
      const end = addMinutes(start, durationMinutes);
      onDateTimeChange(start, end, durationMinutes);
    }
  }, [startDateTime, durationMinutes, onDateTimeChange]);

  // Get current date/time in Cairo timezone for minimum date
  const getMinDateTime = () => {
    const now = new Date();
    const cairoTime = new Date(now.toLocaleString("en-US", { timeZone: CAIRO_TIMEZONE }));
    return formatInTimeZone(cairoTime, CAIRO_TIMEZONE, "yyyy-MM-dd'T'HH:mm");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label htmlFor="start-datetime" className="text-sm font-medium text-foreground">
          Start Date & Time <span className="text-muted-foreground">(Cairo Time)</span>
        </Label>
        <Input
          id="start-datetime"
          type="datetime-local"
          value={startDateTime}
          onChange={(e) => setStartDateTime(e.target.value)}
          min={getMinDateTime()}
          disabled={disabled}
          className="mt-1"
          data-testid="start-datetime-input"
        />
      </div>

      <div>
        <Label htmlFor="duration" className="text-sm font-medium text-foreground">
          Duration
        </Label>
        <Select
          value={durationMinutes.toString()}
          onValueChange={(value) => setDurationMinutes(parseInt(value))}
          disabled={disabled}
        >
          <SelectTrigger className="mt-1" data-testid="duration-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getDurationOptions().map(option => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {startDateTime && (
        <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
          <div className="flex items-center mb-1">
            <i className="fas fa-clock mr-2 text-primary"></i>
            <span className="font-medium">Booking Summary</span>
          </div>
          <div>
            Start: {formatInTimeZone(new Date(startDateTime), CAIRO_TIMEZONE, "PPP 'at' p")}
          </div>
          <div>
            End: {formatInTimeZone(addMinutes(new Date(startDateTime), durationMinutes), CAIRO_TIMEZONE, "PPP 'at' p")}
          </div>
          <div className="mt-2 text-xs">
            <i className="fas fa-info-circle mr-1"></i>
            All times shown in Cairo timezone
          </div>
        </div>
      )}
    </div>
  );
}
