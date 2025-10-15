import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Area,
    AreaChart
} from 'recharts';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    Info
} from 'lucide-react';
import { useState } from 'react';

interface RevenueData {
    period: string;
    revenue: number;
    bookings: number;
    avgBookingValue: number;
}

interface RevenueChartProps {
    data: RevenueData[];
    timeRange?: 'week' | 'month' | 'quarter' | 'year';
    onTimeRangeChange?: (timeRange: string) => void;
}

// Mock data generator
const generateMockData = (timeRange: string): RevenueData[] => {
    const baseData = {
        week: [
            { period: 'Mon', revenue: 1200, bookings: 3, avgBookingValue: 400 },
            { period: 'Tue', revenue: 800, bookings: 2, avgBookingValue: 400 },
            { period: 'Wed', revenue: 1600, bookings: 4, avgBookingValue: 400 },
            { period: 'Thu', revenue: 2000, bookings: 5, avgBookingValue: 400 },
            { period: 'Fri', revenue: 2400, bookings: 6, avgBookingValue: 400 },
            { period: 'Sat', revenue: 3200, bookings: 8, avgBookingValue: 400 },
            { period: 'Sun', revenue: 2800, bookings: 7, avgBookingValue: 400 },
        ],
        month: [
            { period: 'Week 1', revenue: 8500, bookings: 21, avgBookingValue: 405 },
            { period: 'Week 2', revenue: 12200, bookings: 29, avgBookingValue: 421 },
            { period: 'Week 3', revenue: 9800, bookings: 24, avgBookingValue: 408 },
            { period: 'Week 4', revenue: 14600, bookings: 35, avgBookingValue: 417 },
        ],
        quarter: [
            { period: 'Jan', revenue: 45200, bookings: 109, avgBookingValue: 415 },
            { period: 'Feb', revenue: 38800, bookings: 94, avgBookingValue: 413 },
            { period: 'Mar', revenue: 52100, bookings: 125, avgBookingValue: 417 },
        ],
        year: [
            { period: 'Q1', revenue: 136100, bookings: 328, avgBookingValue: 415 },
            { period: 'Q2', revenue: 142500, bookings: 341, avgBookingValue: 418 },
            { period: 'Q3', revenue: 158200, bookings: 378, avgBookingValue: 419 },
            { period: 'Q4', revenue: 165800, bookings: 394, avgBookingValue: 421 },
        ],
    };
    return baseData[timeRange as keyof typeof baseData] || baseData.month;
};

export default function RevenueChart({
    data = [],
    timeRange = 'month',
    onTimeRangeChange
}: RevenueChartProps) {
    const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('area');

    // Use provided data or generate mock data
    const chartData = data.length > 0 ? data : generateMockData(timeRange);

    // Calculate summary metrics
    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
    const totalBookings = chartData.reduce((sum, item) => sum + item.bookings, 0);
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Calculate growth compared to previous period (mock calculation)
    const currentPeriodRevenue = chartData.slice(-Math.ceil(chartData.length / 2))
        .reduce((sum, item) => sum + item.revenue, 0);
    const previousPeriodRevenue = chartData.slice(0, Math.floor(chartData.length / 2))
        .reduce((sum, item) => sum + item.revenue, 0);
    const growthRate = previousPeriodRevenue > 0
        ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
        : 0;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatTooltipValue = (value: number, name: string) => {
        if (name === 'revenue' || name === 'avgBookingValue') {
            return [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Avg Booking Value'];
        }
        return [value, name === 'bookings' ? 'Bookings' : name];
    };

    const renderChart = () => {
        const commonProps = {
            data: chartData,
            margin: { top: 5, right: 30, left: 20, bottom: 5 },
        };

        switch (chartType) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                            dataKey="period"
                            className="text-xs"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fontSize: 12 }}
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip
                            formatter={formatTooltipValue}
                            labelClassName="text-gray-600"
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                        />
                    </LineChart>
                );

            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                            dataKey="period"
                            className="text-xs"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fontSize: 12 }}
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip
                            formatter={formatTooltipValue}
                            labelClassName="text-gray-600"
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                        />
                        <Bar
                            dataKey="revenue"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                );

            case 'area':
            default:
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                            dataKey="period"
                            className="text-xs"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fontSize: 12 }}
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip
                            formatter={formatTooltipValue}
                            labelClassName="text-gray-600"
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="url(#revenueGradient)"
                        />
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                    </AreaChart>
                );
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5" />
                        <span>Revenue Analytics</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="area">Area</SelectItem>
                                <SelectItem value="line">Line</SelectItem>
                                <SelectItem value="bar">Bar</SelectItem>
                            </SelectContent>
                        </Select>
                        {onTimeRangeChange && (
                            <Select value={timeRange} onValueChange={onTimeRangeChange}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="week">This Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="quarter">This Quarter</SelectItem>
                                    <SelectItem value="year">This Year</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-900">Total Revenue</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(totalRevenue)}
                                </p>
                            </div>
                            <div className={`flex items-center space-x-1 ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {growthRate >= 0 ? (
                                    <TrendingUp className="h-4 w-4" />
                                ) : (
                                    <TrendingDown className="h-4 w-4" />
                                )}
                                <span className="text-sm font-medium">
                                    {Math.abs(growthRate).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-900">Total Bookings</p>
                                <p className="text-2xl font-bold text-green-600">{totalBookings}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-900">Avg Booking Value</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {formatCurrency(avgBookingValue)}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </div>

                {/* Growth Insight */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                        <Info className="h-4 w-4 text-gray-600 mt-0.5" />
                        <div className="text-sm text-gray-600">
                            <strong>Performance Insight:</strong> {growthRate >= 0 ? (
                                <>Your revenue has grown by <span className="text-green-600 font-medium">{growthRate.toFixed(1)}%</span> compared to the previous period. Great work!</>
                            ) : (
                                <>Your revenue has decreased by <span className="text-red-600 font-medium">{Math.abs(growthRate).toFixed(1)}%</span> compared to the previous period. Consider reviewing your pricing or marketing strategy.</>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
