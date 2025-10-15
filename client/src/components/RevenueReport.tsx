import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Clock,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';

export interface RevenueData {
  period: string;
  revenue: number;
  bookings: number;
  averageBookingValue: number;
  cancellationRate: number;
  growth: number; // percentage
}

export interface VenueRevenueData {
  venueId: string;
  venueName: string;
  revenue: number;
  bookings: number;
  averageBookingValue: number;
  utilizationRate: number;
}

interface RevenueReportProps {
  data: RevenueData[];
  venueData: VenueRevenueData[];
  isLoading?: boolean;
  onPeriodChange: (period: string) => void;
  onRefresh: () => void;
  onExport: (format: 'pdf' | 'csv' | 'excel') => void;
  selectedPeriod: string;
}

export default function RevenueReport({
  data,
  venueData,
  isLoading = false,
  onPeriodChange,
  onRefresh,
  onExport,
  selectedPeriod,
}: RevenueReportProps) {
  const [sortBy, setSortBy] = useState<'revenue' | 'bookings' | 'average'>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Calculate totals
  const totals = data.reduce(
    (acc, item) => ({
      revenue: acc.revenue + item.revenue,
      bookings: acc.bookings + item.bookings,
      averageBookingValue: 0, // Will calculate below
      cancellationRate: 0, // Will calculate below
    }),
    { revenue: 0, bookings: 0, averageBookingValue: 0, cancellationRate: 0 }
  );

  totals.averageBookingValue = totals.bookings > 0 ? totals.revenue / totals.bookings : 0;
  totals.cancellationRate = data.reduce((acc, item) => acc + item.cancellationRate, 0) / data.length || 0;

  // Get latest period for comparison
  const latestPeriod = data[data.length - 1];
  const previousPeriod = data[data.length - 2];

  // Sort venue data
  const sortedVenueData = [...venueData].sort((a, b) => {
    const aValue = a[sortBy === 'average' ? 'averageBookingValue' : sortBy];
    const bValue = b[sortBy === 'average' ? 'averageBookingValue' : sortBy];
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Report
            </CardTitle>

            <div className="flex items-center gap-2">
              {/* Period Selector */}
              <Select value={selectedPeriod} onValueChange={onPeriodChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>

              {/* Export Dropdown */}
              <Select onValueChange={(format) => onExport(format as 'pdf' | 'csv' | 'excel')}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      PDF
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      CSV
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Excel
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{formatCurrency(totals.revenue)} EGP</p>
                  {latestPeriod && previousPeriod && (
                    <div className={`flex items-center gap-1 text-sm ${getGrowthColor(latestPeriod.growth)}`}>
                      {getGrowthIcon(latestPeriod.growth)}
                      {formatPercentage(latestPeriod.growth)}
                    </div>
                  )}
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{totals.bookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Booking Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totals.averageBookingValue)} EGP</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancellation Rate</p>
                <p className="text-2xl font-bold">{totals.cancellationRate.toFixed(1)}%</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple bar chart representation */}
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
              {data.map((item, index) => {
                const maxRevenue = Math.max(...data.map(d => d.revenue));
                const height = (item.revenue / maxRevenue) * 200;

                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600 cursor-pointer"
                      style={{ height: `${height}px`, minHeight: '20px' }}
                      title={`${item.period}: ${formatCurrency(item.revenue)} EGP`}
                    />
                    <div className="text-xs text-center mt-2 text-muted-foreground">
                      {item.period}
                    </div>
                    <div className="text-xs text-center font-medium">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Venue Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Venue Performance</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="bookings">Bookings</SelectItem>
                  <SelectItem value="average">Avg. Value</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              >
                {sortOrder === 'desc' ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedVenueData.map((venue, index) => (
              <div key={venue.venueId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{venue.venueName}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{venue.bookings} bookings</span>
                      <span>{venue.utilizationRate.toFixed(1)}% utilization</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-lg">{formatCurrency(venue.revenue)} EGP</div>
                  <div className="text-sm text-muted-foreground">
                    Avg: {formatCurrency(venue.averageBookingValue)} EGP
                  </div>
                </div>
              </div>
            ))}

            {sortedVenueData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No venue data available for the selected period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Period</th>
                  <th className="text-right py-2">Revenue</th>
                  <th className="text-right py-2">Bookings</th>
                  <th className="text-right py-2">Avg. Value</th>
                  <th className="text-right py-2">Cancellation Rate</th>
                  <th className="text-right py-2">Growth</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 font-medium">{item.period}</td>
                    <td className="text-right py-3">{formatCurrency(item.revenue)} EGP</td>
                    <td className="text-right py-3">{item.bookings}</td>
                    <td className="text-right py-3">{formatCurrency(item.averageBookingValue)} EGP</td>
                    <td className="text-right py-3">{item.cancellationRate.toFixed(1)}%</td>
                    <td className={`text-right py-3 ${getGrowthColor(item.growth)}`}>
                      <div className="flex items-center justify-end gap-1">
                        {getGrowthIcon(item.growth)}
                        {formatPercentage(item.growth)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
