import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
    Calendar as CalendarIcon,
    ChevronDown,
    X,
    Clock,
    TrendingUp
} from 'lucide-react';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import type { DateRange } from 'react-day-picker';

// export interface DateRange {
//     from?: Date;
//     to?: Date;
// }

interface DateRangePickerProps {
    value?: DateRange;
    onChange?: (dateRange: DateRange | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    presets?: boolean;
}

interface Preset {
    label: string;
    value: string;
    range: DateRange;
    description?: string;
}

export default function DateRangePicker({
    value,
    onChange,
    placeholder = 'Select date range',
    disabled = false,
    presets = true
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

    const today = new Date();

    const presetOptions: Preset[] = [
        {
            label: 'Today',
            value: 'today',
            range: { from: startOfDay(today), to: endOfDay(today) },
            description: 'Current day'
        },
        {
            label: 'Yesterday',
            value: 'yesterday',
            range: {
                from: startOfDay(subDays(today, 1)),
                to: endOfDay(subDays(today, 1))
            },
            description: 'Previous day'
        },
        {
            label: 'Last 7 days',
            value: 'last7days',
            range: { from: subDays(today, 6), to: today },
            description: 'Including today'
        },
        {
            label: 'Last 14 days',
            value: 'last14days',
            range: { from: subDays(today, 13), to: today },
            description: 'Including today'
        },
        {
            label: 'Last 30 days',
            value: 'last30days',
            range: { from: subDays(today, 29), to: today },
            description: 'Including today'
        },
        {
            label: 'This week',
            value: 'thisweek',
            range: { from: subDays(today, today.getDay()), to: today },
            description: 'Sunday to today'
        },
        {
            label: 'This month',
            value: 'thismonth',
            range: {
                from: new Date(today.getFullYear(), today.getMonth(), 1),
                to: today
            },
            description: '1st to today'
        },
        {
            label: 'Last month',
            value: 'lastmonth',
            range: {
                from: subMonths(new Date(today.getFullYear(), today.getMonth(), 1), 1),
                to: subDays(new Date(today.getFullYear(), today.getMonth(), 1), 1)
            },
            description: 'Previous month'
        },
        {
            label: 'This quarter',
            value: 'thisquarter',
            range: {
                from: new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1),
                to: today
            },
            description: 'Q' + (Math.floor(today.getMonth() / 3) + 1)
        },
        {
            label: 'This year',
            value: 'thisyear',
            range: {
                from: new Date(today.getFullYear(), 0, 1),
                to: today
            },
            description: 'Jan 1 to today'
        },
    ];

    const handlePresetSelect = (preset: Preset) => {
        setSelectedPreset(preset.value);
        onChange?.(preset.range);
        setIsOpen(false);
    };

    const handleCustomDateSelect = (dateRange: DateRange | undefined) => {
        setSelectedPreset(null);
        if (dateRange) {
            onChange?.(dateRange);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedPreset(null);
        onChange?.({ from: undefined, to: undefined });
    };

    const formatDateRange = (dateRange?: DateRange) => {
        if (!dateRange?.from) {
            return placeholder;
        }

        if (!dateRange.to) {
            return format(dateRange.from, 'MMM d, yyyy');
        }

        if (format(dateRange.from, 'yyyy-MM-dd') === format(dateRange.to, 'yyyy-MM-dd')) {
            return format(dateRange.from, 'MMM d, yyyy');
        }

        return `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
    };

    const getSelectedPresetLabel = () => {
        if (selectedPreset) {
            const preset = presetOptions.find(p => p.value === selectedPreset);
            return preset?.label;
        }
        return null;
    };

    const getDaysDifference = (dateRange?: DateRange) => {
        if (!dateRange?.from || !dateRange?.to) return null;
        const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const daysDiff = getDaysDifference(value);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={`w-full justify-start text-left font-normal ${!value?.from && 'text-muted-foreground'
                        }`}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <div className="flex-1 flex items-center justify-between">
                        <span>{formatDateRange(value)}</span>
                        <div className="flex items-center space-x-2">
                            {daysDiff && (
                                <Badge variant="secondary" className="text-xs">
                                    {daysDiff} day{daysDiff !== 1 ? 's' : ''}
                                </Badge>
                            )}
                            {getSelectedPresetLabel() && (
                                <Badge variant="outline" className="text-xs">
                                    {getSelectedPresetLabel()}
                                </Badge>
                            )}
                            {value?.from && (
                                <X
                                    className="h-4 w-4 text-gray-400 hover:text-gray-600"
                                    onClick={handleClear}
                                />
                            )}
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                    {/* Presets Sidebar */}
                    {presets && (
                        <div className="border-r p-3 min-w-[200px]">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium leading-none mb-3">Quick Select</h4>
                                {presetOptions.map((preset) => (
                                    <button
                                        key={preset.value}
                                        onClick={() => handlePresetSelect(preset)}
                                        className={`w-full text-left p-2 text-sm rounded-md transition-colors ${selectedPreset === preset.value
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{preset.label}</span>
                                            {preset.value === 'last7days' || preset.value === 'last30days' ? (
                                                <TrendingUp className="h-3 w-3 text-gray-400" />
                                            ) : preset.value === 'today' ? (
                                                <Clock className="h-3 w-3 text-gray-400" />
                                            ) : null}
                                        </div>
                                        {preset.description && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {preset.description}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Calendar */}
                    <div className="p-3">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={value?.from}
                            selected={value}
                            onSelect={handleCustomDateSelect}
                            numberOfMonths={2}
                            disabled={(date) => date > today}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-3 bg-gray-50">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Select a range or use presets</span>
                        {value?.from && value?.to && (
                            <span className="flex items-center space-x-1">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{getDaysDifference(value)} days selected</span>
                            </span>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
