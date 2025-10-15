import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';
import DateRangePicker from '@/components/DateRangePicker';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface AnalyticsData {
  totalUsers: number;
  totalHosts: number;
  totalVenues: number;
  totalBookings: number;
  totalRevenue: number;
  revenueGrowth: number;
  userGrowth: number;
  bookingGrowth: number;
  averageBookingValue: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  topVenues: Array<{ id: string; name: string; revenue: number; bookings: number }>;
}

export default function AdminAnalytics() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      router.push('/');
    }
  }, [authLoading, isAuthenticated, user, toast, router]);

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', dateRange.startDate, dateRange.endDate],
    queryFn: () => adminApi.getAnalytics(dateRange.startDate, dateRange.endDate),
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const analytics: AnalyticsData = (analyticsData as any)?.data || {
    totalUsers: 0,
    totalHosts: 0,
    totalVenues: 0,
    totalBookings: 0,
    totalRevenue: 0,
    revenueGrowth: 0,
    userGrowth: 0,
    bookingGrowth: 0,
    averageBookingValue: 0,
    monthlyRevenue: [],
    topVenues: [],
  };

  const handleDateChange = (range?: DateRange) => {
    setDateRange({
      startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
      endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
    });
  };

  // const handleDateRangeChange = (startDate: string, endDate: string) => {
  //   setDateRange({ startDate, endDate });
  // };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <ArrowUpRight className="h-4 w-4 mr-1" />
        ) : (
          <ArrowDownRight className="h-4 w-4 mr-1" />
        )}
        {Math.abs(growth).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="h-8 w-8" />
                Platform Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor platform performance and growth metrics
              </p>
            </div>

            <div className="mt-4 sm:mt-0">
              <DateRangePicker onChange={handleDateChange} />
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {formatGrowth(analytics.revenueGrowth)} from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {formatGrowth(analytics.userGrowth)} from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalBookings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {formatGrowth(analytics.bookingGrowth)} from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.averageBookingValue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Per booking
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="venues">Venues</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Platform Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Total Users
                    </span>
                    <span className="text-sm text-muted-foreground">{analytics.totalUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Active Hosts
                    </span>
                    <span className="text-sm text-muted-foreground">{analytics.totalHosts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Total Venues
                    </span>
                    <span className="text-sm text-muted-foreground">{analytics.totalVenues}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Total Bookings
                    </span>
                    <span className="text-sm text-muted-foreground">{analytics.totalBookings}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Growth Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Revenue Growth</span>
                    {formatGrowth(analytics.revenueGrowth)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User Growth</span>
                    {formatGrowth(analytics.userGrowth)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Booking Growth</span>
                    {formatGrowth(analytics.bookingGrowth)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Host to User Ratio</span>
                    <span className="text-sm text-muted-foreground">
                      {((analytics.totalHosts / analytics.totalUsers) * 100).toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="h-80 flex items-end justify-between space-x-2">
                    {analytics.monthlyRevenue.map((item, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-blue-500 rounded-t"
                          style={{
                            height: `${(item.revenue / Math.max(...analytics.monthlyRevenue.map(r => r.revenue))) * 200}px`,
                            minHeight: '4px',
                          }}
                        />
                        <div className="text-xs text-center mt-2 font-medium">{item.month}</div>
                        <div className="text-xs text-gray-500 text-center">
                          {formatCurrency(item.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="venues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Venues</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics.topVenues.map((venue, index) => (
                      <div key={venue.id} className="flex items-center justify-between p-4 border rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{venue.name}</div>
                            <div className="text-sm text-gray-500">{venue.bookings} bookings</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(venue.revenue)}</div>
                          <div className="text-sm text-gray-500">revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
