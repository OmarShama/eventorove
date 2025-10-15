import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, FileBarChart, Download, TrendingUp } from 'lucide-react';

// Import our components
import RevenueReport, { RevenueData, VenueRevenueData } from '@/components/RevenueReport';
import ExportOptions, { ExportConfig } from '@/components/ExportOptions';
import ReportFilters, { ReportFilters as ReportFiltersType } from '@/components/ReportFilters';

// Mock data - replace with actual API calls
const mockRevenueData: RevenueData[] = [
  {
    period: 'Jan 2024',
    revenue: 15000,
    bookings: 25,
    averageBookingValue: 600,
    cancellationRate: 8.5,
    growth: 12.5,
  },
  {
    period: 'Feb 2024',
    revenue: 18200,
    bookings: 30,
    averageBookingValue: 607,
    cancellationRate: 6.2,
    growth: 21.3,
  },
  {
    period: 'Mar 2024',
    revenue: 22100,
    bookings: 35,
    averageBookingValue: 631,
    cancellationRate: 5.1,
    growth: 21.4,
  },
  {
    period: 'Apr 2024',
    revenue: 19800,
    bookings: 32,
    averageBookingValue: 619,
    cancellationRate: 7.8,
    growth: -10.4,
  },
  {
    period: 'May 2024',
    revenue: 24500,
    bookings: 38,
    averageBookingValue: 645,
    cancellationRate: 4.2,
    growth: 23.7,
  },
  {
    period: 'Jun 2024',
    revenue: 27300,
    bookings: 42,
    averageBookingValue: 650,
    cancellationRate: 3.9,
    growth: 11.4,
  },
];

const mockVenueRevenueData: VenueRevenueData[] = [
  {
    venueId: 'venue-1',
    venueName: 'Executive Conference Room',
    revenue: 45000,
    bookings: 68,
    averageBookingValue: 662,
    utilizationRate: 75.3,
  },
  {
    venueId: 'venue-2',
    venueName: 'Main Event Hall',
    revenue: 38500,
    bookings: 28,
    averageBookingValue: 1375,
    utilizationRate: 82.1,
  },
  {
    venueId: 'venue-3',
    venueName: 'Creative Studio A',
    revenue: 25200,
    bookings: 45,
    averageBookingValue: 560,
    utilizationRate: 68.9,
  },
  {
    venueId: 'venue-4',
    venueName: 'Creative Studio B',
    revenue: 18100,
    bookings: 32,
    averageBookingValue: 566,
    utilizationRate: 54.2,
  },
];

const mockVenues = [
  { id: 'venue-1', name: 'Executive Conference Room' },
  { id: 'venue-2', name: 'Main Event Hall' },
  { id: 'venue-3', name: 'Creative Studio A' },
  { id: 'venue-4', name: 'Creative Studio B' },
];

export default function HostReports() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<ReportFiltersType>({
    dateRange: {
      start: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      preset: '6m',
    },
    groupBy: 'month',
  });

  // Redirect if not authenticated or not a host
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'host' && user?.role !== 'admin'))) {
      toast({
        title: "Access Denied",
        description: "You need to be a host to access this page.",
        variant: "destructive",
      });
      router.push('/');
    }
  }, [authLoading, isAuthenticated, user, toast, router]);

  // Mock data queries - replace with actual API calls
  const { data: revenueData = mockRevenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-report', filters],
    queryFn: () => {
      // Simulate API delay and filtering
      return new Promise<RevenueData[]>(resolve => {
        setTimeout(() => {
          // In a real app, this would filter the data based on filters
          resolve(mockRevenueData);
        }, 1000);
      });
    },
    enabled: isAuthenticated,
  });

  const { data: venueRevenueData = mockVenueRevenueData, isLoading: venueLoading } = useQuery({
    queryKey: ['venue-revenue', filters],
    queryFn: () => {
      return new Promise<VenueRevenueData[]>(resolve => {
        setTimeout(() => {
          let filteredData = mockVenueRevenueData;

          // Apply venue filter
          if (filters.venues && filters.venues.length > 0) {
            filteredData = filteredData.filter(venue => filters.venues!.includes(venue.venueId));
          }

          resolve(filteredData);
        }, 800);
      });
    },
    enabled: isAuthenticated,
  });

  const { data: venues = mockVenues } = useQuery({
    queryKey: ['host-venues'],
    queryFn: () => Promise.resolve(mockVenues),
    enabled: isAuthenticated,
  });

  // Compute summary statistics
  const summaryStats = useMemo(() => {
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalBookings = revenueData.reduce((sum, item) => sum + item.bookings, 0);
    const averageGrowth = revenueData.reduce((sum, item) => sum + item.growth, 0) / revenueData.length;
    const averageCancellationRate = revenueData.reduce((sum, item) => sum + item.cancellationRate, 0) / revenueData.length;

    return {
      totalRevenue,
      totalBookings,
      averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
      averageGrowth,
      averageCancellationRate,
    };
  }, [revenueData]);

  // Handler functions
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);

    // Update filters based on period
    const now = new Date();
    let start: string;
    let end: string = now.toISOString().split('T')[0];
    let groupBy: ReportFiltersType['groupBy'] = 'day';

    switch (period) {
      case '7d':
        const week = new Date(now);
        week.setDate(week.getDate() - 7);
        start = week.toISOString().split('T')[0];
        groupBy = 'day';
        break;
      case '30d':
        const month = new Date(now);
        month.setDate(month.getDate() - 30);
        start = month.toISOString().split('T')[0];
        groupBy = 'week';
        break;
      case '3m':
        const threeMonths = new Date(now);
        threeMonths.setMonth(threeMonths.getMonth() - 3);
        start = threeMonths.toISOString().split('T')[0];
        groupBy = 'week';
        break;
      case '6m':
        const sixMonths = new Date(now);
        sixMonths.setMonth(sixMonths.getMonth() - 6);
        start = sixMonths.toISOString().split('T')[0];
        groupBy = 'month';
        break;
      case '1y':
        const year = new Date(now);
        year.setFullYear(year.getFullYear() - 1);
        start = year.toISOString().split('T')[0];
        groupBy = 'month';
        break;
      default:
        return;
    }

    setFilters({
      ...filters,
      dateRange: { start, end, preset: period },
      groupBy,
    });
  };

  const handleRefresh = () => {
    // In a real app, this would refresh the data
    toast({
      title: "Data Refreshed",
      description: "Report data has been updated with the latest information.",
    });
  };

  const handleExport = async (config: ExportConfig) => {
    setIsExporting(true);

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // In a real app, this would generate and download the file
      const formatName = config.format.toUpperCase();
      toast({
        title: "Export Complete",
        description: `Your report has been exported as ${formatName} and is downloading now.`,
      });

      setIsExportOpen(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFiltersChange = (newFilters: ReportFiltersType) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Trigger data refetch with new filters
    toast({
      title: "Filters Applied",
      description: "Report data is being updated with your filter settings.",
    });
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: {
        start: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
        preset: '6m',
      },
      groupBy: 'month',
    });
    setSelectedPeriod('6m');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'host' && user?.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/host/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Revenue Reports</h1>
              <p className="text-gray-600 mt-2">
                Analyze your venue performance and revenue trends
              </p>
            </div>

            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <Button
                variant="outline"
                onClick={() => setIsExportOpen(true)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Report Filters */}
        <ReportFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          venues={venues}
          onReset={handleResetFilters}
          onApply={handleApplyFilters}
          isLoading={revenueLoading || venueLoading}
        />

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Revenue Analysis
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <FileBarChart className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileBarChart className="h-4 w-4" />
              Executive Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <RevenueReport
              data={revenueData}
              venueData={venueRevenueData}
              isLoading={revenueLoading || venueLoading}
              onPeriodChange={handlePeriodChange}
              onRefresh={handleRefresh}
              onExport={() => setIsExportOpen(true)}
              selectedPeriod={selectedPeriod}
            />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {/* Venue Performance Details */}
            <div className="grid gap-4 md:grid-cols-2">
              {venueRevenueData.map(venue => (
                <div key={venue.venueId} className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">{venue.venueName}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-semibold">{venue.revenue.toLocaleString()} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bookings:</span>
                      <span className="font-semibold">{venue.bookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Booking Value:</span>
                      <span className="font-semibold">{venue.averageBookingValue.toLocaleString()} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utilization Rate:</span>
                      <span className="font-semibold">{venue.utilizationRate}%</span>
                    </div>
                  </div>

                  {/* Utilization Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Utilization</span>
                      <span>{venue.utilizationRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${venue.utilizationRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            {/* Executive Summary */}
            <div className="bg-white p-8 rounded-lg border">
              <h2 className="text-2xl font-bold mb-6">Executive Summary</h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Key Performance Indicators</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-bold text-xl text-green-600">
                        {summaryStats.totalRevenue.toLocaleString()} EGP
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Bookings:</span>
                      <span className="font-semibold text-lg">{summaryStats.totalBookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Booking Value:</span>
                      <span className="font-semibold text-lg">
                        {summaryStats.averageBookingValue.toLocaleString()} EGP
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Growth Rate:</span>
                      <span className={`font-semibold text-lg ${summaryStats.averageGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {summaryStats.averageGrowth >= 0 ? '+' : ''}{summaryStats.averageGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Top Performing Venue</h3>
                  {venueRevenueData.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900">
                        {venueRevenueData[0].venueName}
                      </h4>
                      <div className="text-sm text-blue-700 mt-2 space-y-1">
                        <p>Revenue: {venueRevenueData[0].revenue.toLocaleString()} EGP</p>
                        <p>Bookings: {venueRevenueData[0].bookings}</p>
                        <p>Utilization: {venueRevenueData[0].utilizationRate}%</p>
                      </div>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold mt-6 mb-4">Recommendations</h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Focus marketing efforts on high-performing venues</li>
                    <li>• Consider pricing adjustments for underperforming venues</li>
                    <li>• Analyze cancellation patterns to improve retention</li>
                    <li>• Expand availability during peak booking periods</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Options Modal */}
        <ExportOptions
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          onExport={handleExport}
          isExporting={isExporting}
        />
      </div>
    </div>
  );
}
