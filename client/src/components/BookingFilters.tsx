import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BookingStatus } from '@/components/BookingStatusBadge';
import {
    Filter,
    Calendar as CalendarIcon,
    Search,
    X,
    SlidersHorizontal
} from 'lucide-react';
import { format } from 'date-fns';

export interface BookingFilters {
    search?: string;
    status?: BookingStatus | 'all';
    dateRange?: {
        from?: Date;
        to?: Date;
    };
    venue?: string;
    sortBy?: 'date' | 'created' | 'cost' | 'status';
    sortOrder?: 'asc' | 'desc';
    showUpcoming?: boolean;
    showPast?: boolean;
}

interface BookingFiltersProps {
    filters: BookingFilters;
    onFiltersChange: (filters: BookingFilters) => void;
    venueOptions?: Array<{ id: string; name: string }>;
    totalBookings?: number;
    filteredCount?: number;
}

export default function BookingFilters({
    filters,
    onFiltersChange,
    venueOptions = [],
    totalBookings = 0,
    filteredCount = 0,
}: BookingFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const updateFilter = (key: keyof BookingFilters, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        });
    };

    const clearFilters = () => {
        onFiltersChange({
            sortBy: 'date',
            sortOrder: 'desc',
        });
    };

    const hasActiveFilters = () => {
        return !!(
            filters.search ||
            (filters.status && filters.status !== 'all') ||
            filters.dateRange?.from ||
            filters.venue ||
            filters.showUpcoming ||
            filters.showPast
        );
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status && filters.status !== 'all') count++;
        if (filters.dateRange?.from) count++;
        if (filters.venue) count++;
        if (filters.showUpcoming) count++;
        if (filters.showPast) count++;
        return count;
    };

    const statusOptions: Array<{ value: BookingStatus | 'all'; label: string }> = [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'payment_pending', label: 'Payment Pending' },
        { value: 'refunded', label: 'Refunded' },
    ];

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <CardTitle className="flex items-center space-x-2">
                            <Filter className="h-5 w-5" />
                            <span>Filters</span>
                        </CardTitle>
                        {hasActiveFilters() && (
                            <Badge variant="secondary" className="ml-2">
                                {getActiveFilterCount()} active
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        {totalBookings > 0 && (
                            <span className="text-sm text-muted-foreground">
                                Showing {filteredCount} of {totalBookings} bookings
                            </span>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Always visible filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="space-y-2">
                        <Label htmlFor="search">Search</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="search"
                                placeholder="Search bookings..."
                                value={filters.search || ''}
                                onChange={(e) => updateFilter('search', e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(value) => updateFilter('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort By */}
                    <div className="space-y-2">
                        <Label htmlFor="sortBy">Sort By</Label>
                        <div className="flex space-x-2">
                            <Select
                                value={filters.sortBy || 'date'}
                                onValueChange={(value) => updateFilter('sortBy', value)}
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Booking Date</SelectItem>
                                    <SelectItem value="created">Date Created</SelectItem>
                                    <SelectItem value="cost">Cost</SelectItem>
                                    <SelectItem value="status">Status</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.sortOrder || 'desc'}
                                onValueChange={(value) => updateFilter('sortOrder', value)}
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asc">↑</SelectItem>
                                    <SelectItem value="desc">↓</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Expandable filters */}
                {isExpanded && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Date Range */}
                            <div className="space-y-2">
                                <Label>Date Range</Label>
                                <div className="flex space-x-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="flex-1 justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {filters.dateRange?.from ? (
                                                    format(filters.dateRange.from, 'MMM dd, yyyy')
                                                ) : (
                                                    'From date'
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={filters.dateRange?.from}
                                                onSelect={(date) =>
                                                    updateFilter('dateRange', {
                                                        ...filters.dateRange,
                                                        from: date,
                                                    })
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="flex-1 justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {filters.dateRange?.to ? (
                                                    format(filters.dateRange.to, 'MMM dd, yyyy')
                                                ) : (
                                                    'To date'
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={filters.dateRange?.to}
                                                onSelect={(date) =>
                                                    updateFilter('dateRange', {
                                                        ...filters.dateRange,
                                                        to: date,
                                                    })
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Venue Filter */}
                            {venueOptions.length > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="venue">Venue</Label>
                                    <Select
                                        value={filters.venue || ''}
                                        onValueChange={(value) => updateFilter('venue', value || undefined)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Venues" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Venues</SelectItem>
                                            {venueOptions.map((venue) => (
                                                <SelectItem key={venue.id} value={venue.id}>
                                                    {venue.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        {/* Quick Filters */}
                        <div className="space-y-2">
                            <Label>Quick Filters</Label>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={filters.showUpcoming ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => updateFilter('showUpcoming', !filters.showUpcoming)}
                                >
                                    Upcoming Only
                                </Button>
                                <Button
                                    variant={filters.showPast ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => updateFilter('showPast', !filters.showPast)}
                                >
                                    Past Bookings
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Clear Filters */}
                {hasActiveFilters() && (
                    <div className="flex justify-end pt-2 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-muted-foreground"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Clear All Filters
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
