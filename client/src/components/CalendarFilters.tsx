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
import { 
  Filter,
  X,
  Search,
  Calendar as CalendarIcon,
  Users,
  MapPin
} from 'lucide-react';

export interface CalendarFilters {
  search?: string;
  status?: 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed';
  venueId?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  guestCountRange?: {
    min?: number;
    max?: number;
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
}

interface CalendarFiltersProps {
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
  venues?: Array<{ id: string; name: string }>;
  onReset: () => void;
}

export default function CalendarFilters({
  filters,
  onFiltersChange,
  venues = [],
  onReset,
}: CalendarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = (updates: Partial<CalendarFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.venueId) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.guestCountRange?.min || filters.guestCountRange?.max) count++;
    if (filters.priceRange?.min || filters.priceRange?.max) count++;
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
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Advanced Filters</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Date Range
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                            From
                          </Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={filters.dateRange?.start || ''}
                            onChange={(e) => updateFilters({
                              dateRange: { ...filters.dateRange, start: e.target.value || undefined }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-date" className="text-xs text-muted-foreground">
                            To
                          </Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={filters.dateRange?.end || ''}
                            onChange={(e) => updateFilters({
                              dateRange: { ...filters.dateRange, end: e.target.value || undefined }
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Guest Count Range */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Guest Count
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="min-guests" className="text-xs text-muted-foreground">
                            Min
                          </Label>
                          <Input
                            id="min-guests"
                            type="number"
                            min="1"
                            placeholder="Any"
                            value={filters.guestCountRange?.min || ''}
                            onChange={(e) => updateFilters({
                              guestCountRange: {
                                ...filters.guestCountRange,
                                min: e.target.value ? parseInt(e.target.value) : undefined
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="max-guests" className="text-xs text-muted-foreground">
                            Max
                          </Label>
                          <Input
                            id="max-guests"
                            type="number"
                            min="1"
                            placeholder="Any"
                            value={filters.guestCountRange?.max || ''}
                            onChange={(e) => updateFilters({
                              guestCountRange: {
                                ...filters.guestCountRange,
                                max: e.target.value ? parseInt(e.target.value) : undefined
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Price Range (EGP)
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="min-price" className="text-xs text-muted-foreground">
                            Min
                          </Label>
                          <Input
                            id="min-price"
                            type="number"
                            min="0"
                            placeholder="Any"
                            value={filters.priceRange?.min || ''}
                            onChange={(e) => updateFilters({
                              priceRange: {
                                ...filters.priceRange,
                                min: e.target.value ? parseFloat(e.target.value) : undefined
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="max-price" className="text-xs text-muted-foreground">
                            Max
                          </Label>
                          <Input
                            id="max-price"
                            type="number"
                            min="0"
                            placeholder="Any"
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
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onReset();
                          setIsOpen(false);
                        }}
                      >
                        Reset All
                      </Button>
                      <Button size="sm" onClick={() => setIsOpen(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onReset}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by guest name..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value || undefined })}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => updateFilters({ status: value as CalendarFilters['status'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Venue Filter */}
            {venues.length > 0 && (
              <Select
                value={filters.venueId || 'all'}
                onValueChange={(value) => updateFilters({ venueId: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
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
            )}

            {/* Quick Date Filters */}
            <Select
              value=""
              onValueChange={(value) => {
                const now = new Date();
                let start: string | undefined;
                let end: string | undefined;

                switch (value) {
                  case 'today':
                    start = end = now.toISOString().split('T')[0];
                    break;
                  case 'tomorrow':
                    const tomorrow = new Date(now);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    start = end = tomorrow.toISOString().split('T')[0];
                    break;
                  case 'this-week':
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay());
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    start = startOfWeek.toISOString().split('T')[0];
                    end = endOfWeek.toISOString().split('T')[0];
                    break;
                  case 'this-month':
                    start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                    end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                    break;
                  case 'next-7-days':
                    start = now.toISOString().split('T')[0];
                    const next7Days = new Date(now);
                    next7Days.setDate(now.getDate() + 7);
                    end = next7Days.toISOString().split('T')[0];
                    break;
                }

                updateFilters({ dateRange: { start, end } });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Quick dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="next-7-days">Next 7 Days</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  {filters.search}
                  <button
                    onClick={() => updateFilters({ search: undefined })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.status && filters.status !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filters.status}
                  <button
                    onClick={() => updateFilters({ status: 'all' })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.venueId && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {venues.find(v => v.id === filters.venueId)?.name || 'Selected Venue'}
                  <button
                    onClick={() => updateFilters({ venueId: undefined })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {(filters.dateRange?.start || filters.dateRange?.end) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {filters.dateRange.start} {filters.dateRange.end && `- ${filters.dateRange.end}`}
                  <button
                    onClick={() => updateFilters({ dateRange: undefined })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {(filters.guestCountRange?.min || filters.guestCountRange?.max) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Guests: {filters.guestCountRange.min || '0'}+
                  {filters.guestCountRange.max && ` - ${filters.guestCountRange.max}`}
                  <button
                    onClick={() => updateFilters({ guestCountRange: undefined })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {(filters.priceRange?.min || filters.priceRange?.max) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Price: {filters.priceRange.min || '0'}+ EGP
                  {filters.priceRange.max && ` - ${filters.priceRange.max} EGP`}
                  <button
                    onClick={() => updateFilters({ priceRange: undefined })}
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
