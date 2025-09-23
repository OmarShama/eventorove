import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import { Venue, BookingWithDetails } from "@shared/schema";

export default function HostDashboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated or not a host
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'host' && user?.role !== 'admin'))) {
      toast({
        title: "Access Denied",
        description: "You need to be a host to access this page.",
        variant: "destructive",
      });
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, toast, setLocation]);

  const { data: venues, isLoading: venuesLoading } = useQuery<Venue[]>({
    queryKey: ['/api/host/venues'],
    queryFn: async () => {
      const response = await fetch('/api/host/venues');
      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }
      return response.json();
    },
    enabled: isAuthenticated && (user?.role === 'host' || user?.role === 'admin'),
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ['/api/host/bookings'],
    queryFn: async () => {
      const response = await fetch('/api/host/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      return response.json();
    },
    enabled: isAuthenticated && (user?.role === 'host' || user?.role === 'admin'),
  });

  if (authLoading || venuesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'host' && user?.role !== 'admin')) {
    return null;
  }

  const stats = {
    totalVenues: venues?.length || 0,
    activeVenues: venues?.filter(v => v.status === 'approved').length || 0,
    pendingVenues: venues?.filter(v => v.status === 'pending_approval').length || 0,
    totalBookings: bookings?.length || 0,
    monthlyRevenue: bookings?.reduce((sum, booking) => sum + parseFloat(booking.totalPriceEGP), 0) || 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-accent text-accent-foreground">Approved</Badge>;
      case 'pending_approval':
        return <Badge className="bg-secondary text-secondary-foreground">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/')}
                data-testid="back-to-home"
              >
                <i className="fas fa-arrow-left"></i>
              </Button>
              <h1 className="text-2xl font-semibold text-foreground">Host Dashboard</h1>
            </div>
            <Button 
              onClick={() => setLocation('/host/venues/new')}
              data-testid="list-new-venue-button"
            >
              <i className="fas fa-plus mr-2"></i>List New Venue
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Venues</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalVenues}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-building text-primary"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Venues</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeVenues}</p>
                </div>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-circle text-accent"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalBookings}</p>
                </div>
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-calendar-check text-secondary"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold text-foreground">₪{stats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-line text-green-600"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="venues" className="space-y-6">
          <TabsList>
            <TabsTrigger value="venues">My Venues</TabsTrigger>
            <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="venues">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Venues</CardTitle>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="secondary">All</Button>
                    <Button size="sm" variant="ghost">Active</Button>
                    <Button size="sm" variant="ghost">Pending</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {venues && venues.length > 0 ? (
                  <div className="space-y-6">
                    {venues.map((venue) => (
                      <div 
                        key={venue.id} 
                        className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="w-24 h-24 rounded-xl bg-muted flex-shrink-0 bg-cover bg-center">
                          {/* Placeholder for venue image */}
                          <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <i className="fas fa-building text-2xl text-primary"></i>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{venue.title}</h3>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(venue.status)}
                              <Button variant="ghost" size="sm">
                                <i className="fas fa-ellipsis-v"></i>
                              </Button>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">
                            {venue.address}, {venue.city} • Up to {venue.capacity} people
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                              <span>
                                <i className="fas fa-star mr-1 text-secondary"></i>4.8 (24 reviews)
                              </span>
                              <span>
                                <i className="fas fa-eye mr-1 text-accent"></i>245 views
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-foreground">
                                ₪{venue.baseHourlyPriceEGP}/hour
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <i className="fas fa-building text-4xl text-muted-foreground mb-4"></i>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No venues yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start earning by listing your first venue.
                    </p>
                    <Button onClick={() => setLocation('/host/venues/new')}>
                      <i className="fas fa-plus mr-2"></i>List Your First Venue
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 10).map((booking) => (
                      <div 
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-sm font-medium">
                              {booking.guest.firstName?.[0]}{booking.guest.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              {booking.guest.firstName} {booking.guest.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {booking.venue.title} • {booking.guestCount} guests
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">₪{booking.totalPriceEGP}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(booking.startDateTime).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <i className="fas fa-calendar-alt text-4xl text-muted-foreground mb-4"></i>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground">
                      Bookings will appear here when guests book your venues.
                    </p>
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
