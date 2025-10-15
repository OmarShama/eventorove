import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import RevenueChart from '@/components/RevenueChart';
import BookingChart from '@/components/BookingChart';
import PerformanceMetrics from '@/components/PerformanceMetrics';
import DateRangePicker from '@/components/DateRangePicker';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    BarChart3,
    Download,
    RefreshCw,
    Calendar,
    DollarSign,
    Users,
    TrendingUp,
    AlertCircle,
    Settings,
    Filter
} from 'lucide-react';
import { subDays, subMonths } from 'date-fns';

export default function HostAnalytics() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
    const [dateRange, setDateRange] = useState<DateRange>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });
    const [activeTab, setActiveTab] = useState('overview');

    // Mock API call for analytics data
    const { data: analyticsData, isLoading, refetch } = useQuery({
        queryKey: ['host-analytics', timeRange, dateRange],
        queryFn: async () => {
            // TODO: Replace with actual API call
            // return hostApi.getAnalytics({ timeRange, dateRange });

            // Mock data
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                success: true,
                data: {
                    summary: {
                        totalRevenue: 45200,
                        totalBookings: 128,
                        avgBookingValue: 353,
                        conversionRate: 78.5,
                    },
                    charts: {
                        revenue: [],
                        bookings: [],
                    }
                }
            };
        },
        enabled: isAuthenticated && (user?.role === 'host' || user?.role === 'admin'),
    });

    // Redirect if not authenticated or not a host
    if (!authLoading && (!isAuthenticated || (user?.role !== 'host' && user?.role !== 'admin'))) {
        router.push('/login');
        return null;
    }

    const handleTimeRangeChange = (newTimeRange: string) => {
        setTimeRange(newTimeRange as typeof timeRange);

        // Auto-adjust date range based on selection
        const now = new Date();
        switch (newTimeRange) {
            case 'week':
                setDateRange({ from: subDays(now, 6), to: now });
                break;
            case 'month':
                setDateRange({ from: subDays(now, 29), to: now });
                break;
            case 'quarter':
                setDateRange({ from: subMonths(now, 3), to: now });
                break;
            case 'year':
                setDateRange({ from: subMonths(now, 12), to: now });
                break;
        }
    };

    const handleExportData = () => {
        toast({
            title: 'Export Started',
            description: 'Your analytics report is being prepared for download.',
        });
        // TODO: Implement export functionality
    };

    const handleRefresh = () => {
        refetch();
        toast({
            title: 'Data Refreshed',
            description: 'Analytics data has been updated with the latest information.',
        });
    };

    // Show loading state
    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-lg text-muted-foreground">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/host/dashboard')}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <BarChart3 className="mr-3 h-8 w-8" />
                                Venue Analytics
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Track your venue performance and optimize for better results
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button onClick={handleRefresh} variant="outline" size="sm">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </Button>
                            <Button onClick={handleExportData} variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Date Range and Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Filter className="h-5 w-5" />
                            <span>Filters & Time Range</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date Range</label>
                                <DateRangePicker
                                    value={dateRange}
                                    onChange={(range) => range && setDateRange(range)}
                                    placeholder="Select date range"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Quick Select</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['week', 'month', 'quarter', 'year'].map((range) => (
                                        <Button
                                            key={range}
                                            variant={timeRange === range ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleTimeRangeChange(range)}
                                            className="capitalize"
                                        >
                                            {range}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Analytics Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                        <TabsTrigger value="overview" className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4" />
                            <span>Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="revenue" className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4" />
                            <span>Revenue</span>
                        </TabsTrigger>
                        <TabsTrigger value="bookings" className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Bookings</span>
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4" />
                            <span>Performance</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-2">
                                        <DollarSign className="h-8 w-8 text-green-600" />
                                        <div>
                                            <p className="text-2xl font-bold">$45.2K</p>
                                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-8 w-8 text-blue-600" />
                                        <div>
                                            <p className="text-2xl font-bold">128</p>
                                            <p className="text-sm text-muted-foreground">Total Bookings</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-8 w-8 text-purple-600" />
                                        <div>
                                            <p className="text-2xl font-bold">$353</p>
                                            <p className="text-sm text-muted-foreground">Avg Booking Value</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp className="h-8 w-8 text-indigo-600" />
                                        <div>
                                            <p className="text-2xl font-bold">78.5%</p>
                                            <p className="text-sm text-muted-foreground">Conversion Rate</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <RevenueChart
                                timeRange={timeRange}
                                onTimeRangeChange={handleTimeRangeChange}
                                data={(analyticsData as any)?.data?.charts?.revenue || []}
                            />
                            <BookingChart
                                timeRange={timeRange}
                                onTimeRangeChange={handleTimeRangeChange}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="revenue" className="space-y-6">
                        <RevenueChart
                            timeRange={timeRange}
                            onTimeRangeChange={handleTimeRangeChange}
                            data={(analyticsData as any)?.data?.charts?.revenue || []}
                        />

                        {/* Revenue Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue by Source</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span>Direct Bookings</span>
                                            <span className="font-medium">$32,400 (72%)</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Platform Referrals</span>
                                            <span className="font-medium">$8,100 (18%)</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Repeat Customers</span>
                                            <span className="font-medium">$4,700 (10%)</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Monthly Targets</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span>Current Month</span>
                                            <span className="font-medium">$45,200</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Monthly Target</span>
                                            <span className="font-medium">$50,000</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Progress</span>
                                            <span className="font-medium text-green-600">90.4%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="bookings" className="space-y-6">
                        <BookingChart
                            timeRange={timeRange}
                            onTimeRangeChange={handleTimeRangeChange}
                        />
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-6">
                        <PerformanceMetrics timeRange={timeRange} />
                    </TabsContent>
                </Tabs>

                {/* Help Section */}
                <Card className="mt-8 bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-blue-900">Analytics Tips</h3>
                                <p className="text-sm text-blue-800 mt-1">
                                    Use these insights to optimize your venue performance. Monitor your conversion rates,
                                    track seasonal trends, and identify opportunities for growth. Need help interpreting your data?
                                    Contact our support team for personalized recommendations.
                                </p>
                                <div className="mt-3 flex space-x-3">
                                    <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Analytics Settings
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                                        Help & Support
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
