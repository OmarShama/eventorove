import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Filter,
  X,
  MapPin,
  DollarSign,
  Users,
  RefreshCw
} from 'lucide-react';

export interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
    preset?: string;
  };
  venues?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  guestRange?: {
    min?: number;
    max?: number;
  };
  bookingStatus?: string[];
  groupBy?: 'day' | 'week' | 'month' | 'quarter';
}

interface ReportFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  venues?: Array<{ id: string; name: string }>;
  onReset: () => void;
  onApply: () => void;
  isLoading?: boolean;
}

export default function ReportFilters({
  filters,
  onFiltersChange,
  venues = [],
  onReset,
  onApply,
  isLoading = false,
}: ReportFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const updateFilters = (updates: Partial<ReportFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const updateDateRange = (start: string, end: string, preset?: string) => {
    updateFilters({
      dateRange: { start, end, preset }
    });
  };

  const setDatePreset = (preset: string) => {
    const now = new Date();
    let start: string;
    let end: string = now.toISOString().split('T')[0];

    switch (preset) {
      case 'today':
        start = end;
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        start = end = yesterday.toISOString().split('T')[0];
        break;
      case '7d':
        const week = new Date(now);
        week.setDate(week.getDate() - 7);
        start = week.toISOString().split('T')[0];
        break;
      case '30d':
        const month = new Date(now);
        month.setDate(month.getDate() - 30);
        start = month.toISOString().split('T')[0];
        break;
      case '3m':
        const threeMonths = new Date(now);
        threeMonths.setMonth(threeMonths.getMonth() - 3);
        start = threeMonths.toISOString().split('T')[0];
        break;
      case '6m':
        const sixMonths = new Date(now);
        sixMonths.setMonth(sixMonths.getMonth() - 6);
        start = sixMonths.toISOString().split('T')[0];
        break;
      case '1y':
        const year = new Date(now);
        year.setFullYear(year.getFullYear() - 1);
        start = year.toISOString().split('T')[0];
        break;
      case 'this-month':
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'last-month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        start = lastMonth.toISOString().split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        break;
      default:
        return;
    }

    updateDateRange(start, end, preset);
  };

  const toggleVenue = (venueId: string) => {
    const currentVenues = filters.venues || [];
    const newVenues = currentVenues.includes(venueId)
      ? currentVenues.filter(id => id !== venueId)
      : [...currentVenues, venueId];

    updateFilters({ venues: newVenues.length > 0 ? newVenues : undefined });
  };

  const toggleBookingStatus = (status: string) => {
    const currentStatuses = filters.bookingStatus || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];

    updateFilters({ bookingStatus: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.venues && filters.venues.length > 0) count++;
    if (filters.priceRange?.min || filters.priceRange?.max) count++;
    if (filters.guestRange?.min || filters.guestRange?.max) count++;
    if (filters.bookingStatus && filters.bookingStatus.length > 0) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onApply}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Apply Filters'
                )}
              </Button>

              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onReset}>
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {/* Date Range Preset */}
            <div className="lg:col-span-2">
              <Label className="text-sm font-medium">Time Period</Label>
              <Select
                value={filters.dateRange.preset || 'custom'}
                onValueChange={(value) => {
                  if (value === 'custom') return;
                  setDatePreset(value);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group By */}
            <div>
              <Label className="text-sm font-medium">Group By</Label>
              <Select
                value={filters.groupBy || 'day'}
                onValueChange={(value) => updateFilters({ groupBy: value as ReportFilters['groupBy'] })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="quarter">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="lg:col-span-2">
              <Label className="text-sm font-medium">Advanced Options</Label>
              <div className="mt-1">
                <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Advanced Filters</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAdvancedOpen(false)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Venue Selection */}
                      {venues.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Venues
                          </Label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {venues.map(venue => (
                              <div key={venue.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`venue-${venue.id}`}
                                  checked={filters.venues?.includes(venue.id) || false}
                                  onCheckedChange={() => toggleVenue(venue.id)}
                                />
                                <Label
                                  htmlFor={`venue-${venue.id}`}
                                  className="text-sm font-normal"
                                >
                                  {venue.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price Range */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Price Range (EGP)
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={filters.priceRange?.min || ''}
                            onChange={(e) => updateFilters({
                              priceRange: {
                                ...filters.priceRange,
                                min: e.target.value ? parseFloat(e.target.value) : undefined
                              }
                            })}
                          />
                          <Input
                            type="number"
                            placeholder="Max"
                            value={filters.priceRange?.max || ''}
                            onChange={(e) => updateFilters({
                              priceRange: {
                                ...filters.priceRange,
                                max: e.target.value ? parseFloat(e.target.value) : undefined
                              }
                            })}
                          />
                        </div>
                      </div>

                      {/* Guest Range */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Guest Count
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={filters.guestRange?.min || ''}
                            onChange={(e) => updateFilters({
                              guestRange: {
                                ...filters.guestRange,
                                min: e.target.value ? parseInt(e.target.value) : undefined
                              }
                            })}
                          />
                          <Input
                            type="number"
                            placeholder="Max"
                            value={filters.guestRange?.max || ''}
                            onChange={(e) => updateFilters({
                              guestRange: {
                                ...filters.guestRange,
                                max: e.target.value ? parseInt(e.target.value) : undefined
                              }
                            })}
                          />
                        </div>
                      </div>

                      {/* Booking Status */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Booking Status</Label>
                        <div className="space-y-2">
                          {['confirmed', 'pending', 'completed', 'cancelled'].map(status => (
                            <div key={status} className="flex items-center space-x-2">
                              <Checkbox
                                id={`status-${status}`}
                                checked={filters.bookingStatus?.includes(status) || false}
                                onCheckedChange={() => toggleBookingStatus(status)}
                              />
                              <Label
                                htmlFor={`status-${status}`}
                                className="text-sm font-normal capitalize"
                              >
                                {status}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onReset}
                        >
                          Reset
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            onApply();
                            setIsAdvancedOpen(false);
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Custom Date Range */}
          {(!filters.dateRange.preset || filters.dateRange.preset === 'custom') && (
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <Label htmlFor="start-date" className="text-sm font-medium">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => updateDateRange(e.target.value, filters.dateRange.end)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-sm font-medium">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => updateDateRange(filters.dateRange.start, e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              {filters.venues && filters.venues.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {filters.venues.length} venue{filters.venues.length !== 1 ? 's' : ''}
                  <button
                    onClick={() => updateFilters({ venues: undefined })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {(filters.priceRange?.min || filters.priceRange?.max) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Price: {filters.priceRange.min || '0'}+
                  {filters.priceRange.max && ` - ${filters.priceRange.max}`} EGP
                  <button
                    onClick={() => updateFilters({ priceRange: undefined })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {(filters.guestRange?.min || filters.guestRange?.max) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Guests: {filters.guestRange.min || '1'}+
                  {filters.guestRange.max && ` - ${filters.guestRange.max}`}
                  <button
                    onClick={() => updateFilters({ guestRange: undefined })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.bookingStatus && filters.bookingStatus.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filters.bookingStatus.join(', ')}
                  <button
                    onClick={() => updateFilters({ bookingStatus: undefined })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
