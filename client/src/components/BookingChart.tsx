import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp
} from 'lucide-react';
import { useState } from 'react';

interface BookingData {
    period: string;
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
    total: number;
}

interface BookingStatusData {
    name: string;
    value: number;
    color: string;
}

interface BookingChartProps {
    data?: BookingData[];
    timeRange?: 'week' | 'month' | 'quarter' | 'year';
    onTimeRangeChange?: (timeRange: string) => void;
}

// Mock data generator
const generateMockBookingData = (timeRange: string): BookingData[] => {
    const baseData = {
        week: [
            { period: 'Mon', confirmed: 2, pending: 1, cancelled: 0, completed: 1, total: 4 },
            { period: 'Tue', confirmed: 1, pending: 0, cancelled: 1, completed: 0, total: 2 },
            { period: 'Wed', confirmed: 3, pending: 1, cancelled: 0, completed: 2, total: 6 },
            { period: 'Thu', confirmed: 4, pending: 2, cancelled: 1, completed: 1, total: 8 },
            { period: 'Fri', confirmed: 5, pending: 1, cancelled: 0, completed: 3, total: 9 },
            { period: 'Sat', confirmed: 6, pending: 2, cancelled: 1, completed: 4, total: 13 },
            { period: 'Sun', confirmed: 5, pending: 1, cancelled: 1, completed: 3, total: 10 },
        ],
        month: [
            { period: 'Week 1', confirmed: 18, pending: 5, cancelled: 2, completed: 15, total: 40 },
            { period: 'Week 2', confirmed: 25, pending: 4, cancelled: 3, completed: 18, total: 50 },
            { period: 'Week 3', confirmed: 22, pending: 6, cancelled: 1, completed: 16, total: 45 },
            { period: 'Week 4', confirmed: 28, pending: 7, cancelled: 2, completed: 22, total: 59 },
        ],
        quarter: [
            { period: 'Jan', confirmed: 85, pending: 18, cancelled: 8, completed: 65, total: 176 },
            { period: 'Feb', confirmed: 78, pending: 15, cancelled: 6, completed: 58, total: 157 },
            { period: 'Mar', confirmed: 92, pending: 22, cancelled: 9, completed: 71, total: 194 },
        ],
        year: [
            { period: 'Q1', confirmed: 255, pending: 55, cancelled: 23, completed: 194, total: 527 },
            { period: 'Q2', confirmed: 268, pending: 48, cancelled: 19, completed: 209, total: 544 },
            { period: 'Q3', confirmed: 285, pending: 52, cancelled: 21, completed: 225, total: 583 },
            { period: 'Q4', confirmed: 295, pending: 58, cancelled: 25, completed: 238, total: 616 },
        ],
    };
    return baseData[timeRange as keyof typeof baseData] || baseData.month;
};

export default function BookingChart({
    data = [],
    timeRange = 'month',
    onTimeRangeChange
}: BookingChartProps) {
    const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

    // Use provided data or generate mock data
    const chartData = data.length > 0 ? data : generateMockBookingData(timeRange);

    // Calculate totals for status breakdown
    const statusTotals = chartData.reduce(
        (acc, item) => ({
            confirmed: acc.confirmed + item.confirmed,
            pending: acc.pending + item.pending,
            cancelled: acc.cancelled + item.cancelled,
            completed: acc.completed + item.completed,
            total: acc.total + item.total,
        }),
        { confirmed: 0, pending: 0, cancelled: 0, completed: 0, total: 0 }
    );

    // Prepare pie chart data
    const pieData: BookingStatusData[] = [
        { name: 'Confirmed', value: statusTotals.confirmed, color: '#10b981' },
        { name: 'Completed', value: statusTotals.completed, color: '#3b82f6' },
        { name: 'Pending', value: statusTotals.pending, color: '#f59e0b' },
        { name: 'Cancelled', value: statusTotals.cancelled, color: '#ef4444' },
    ].filter(item => item.value > 0);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-blue-600" />;
            default:
                return <Calendar className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return '#10b981';
            case 'pending':
                return '#f59e0b';
            case 'cancelled':
                return '#ef4444';
            case 'completed':
                return '#3b82f6';
            default:
                return '#6b7280';
        }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="capitalize">{entry.dataKey}:</span>
                            <span className="font-medium">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const CustomPieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: data.payload.color }}
                        />
                        <span className="font-medium">{data.name}:</span>
                        <span>{data.value} bookings</span>
                        <span className="text-gray-500">
                            ({((data.value / statusTotals.total) * 100).toFixed(1)}%)
                        </span>
                    </div>
                </div>
            );
        }
        return null;
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
                        <XAxis dataKey="period" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="confirmed"
                            stroke={getStatusColor('confirmed')}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="completed"
                            stroke={getStatusColor('completed')}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="pending"
                            stroke={getStatusColor('pending')}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="cancelled"
                            stroke={getStatusColor('cancelled')}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    </LineChart>
                );

            case 'pie':
                return (
                    <PieChart width={400} height={300}>
                        <Pie
                            data={pieData}
                            cx={200}
                            cy={150}
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                );

            case 'bar':
            default:
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="period" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                            dataKey="confirmed"
                            stackId="a"
                            fill={getStatusColor('confirmed')}
                            radius={[0, 0, 0, 0]}
                            name="Confirmed"
                        />
                        <Bar
                            dataKey="completed"
                            stackId="a"
                            fill={getStatusColor('completed')}
                            radius={[0, 0, 0, 0]}
                            name="Completed"
                        />
                        <Bar
                            dataKey="pending"
                            stackId="a"
                            fill={getStatusColor('pending')}
                            radius={[0, 0, 0, 0]}
                            name="Pending"
                        />
                        <Bar
                            dataKey="cancelled"
                            stackId="a"
                            fill={getStatusColor('cancelled')}
                            radius={[4, 4, 0, 0]}
                            name="Cancelled"
                        />
                    </BarChart>
                );
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>Booking Analytics</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bar">Bar</SelectItem>
                                <SelectItem value="line">Line</SelectItem>
                                <SelectItem value="pie">Pie</SelectItem>
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
                {/* Status Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        {getStatusIcon('confirmed')}
                        <div>
                            <p className="text-sm text-green-900 font-medium">Confirmed</p>
                            <p className="text-xl font-bold text-green-600">{statusTotals.confirmed}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        {getStatusIcon('completed')}
                        <div>
                            <p className="text-sm text-blue-900 font-medium">Completed</p>
                            <p className="text-xl font-bold text-blue-600">{statusTotals.completed}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        {getStatusIcon('pending')}
                        <div>
                            <p className="text-sm text-yellow-900 font-medium">Pending</p>
                            <p className="text-xl font-bold text-yellow-600">{statusTotals.pending}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                        {getStatusIcon('cancelled')}
                        <div>
                            <p className="text-sm text-red-900 font-medium">Cancelled</p>
                            <p className="text-xl font-bold text-red-600">{statusTotals.cancelled}</p>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="h-80 flex items-center justify-center">
                    {chartType === 'pie' ? (
                        renderChart()
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            {renderChart()}
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Performance Metrics */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Success Rate</span>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                                {((statusTotals.confirmed + statusTotals.completed) / statusTotals.total * 100).toFixed(1)}%
                            </Badge>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Cancellation Rate</span>
                            <Badge variant="outline" className="bg-red-100 text-red-800">
                                {(statusTotals.cancelled / statusTotals.total * 100).toFixed(1)}%
                            </Badge>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Bookings</span>
                            <div className="flex items-center space-x-1">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="font-medium">{statusTotals.total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
