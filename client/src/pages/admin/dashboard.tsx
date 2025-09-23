import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import { VenueWithDetails, BookingWithDetails } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, toast, setLocation]);

  const { data: pendingVenues, isLoading: pendingLoading } = useQuery<VenueWithDetails[]>({
    queryKey: ['/api/admin/venues', 'pending_approval'],
    queryFn: async () => {
      const response = await fetch('/api/admin/venues?status=pending_approval');
      if (!response.ok) throw new Error('Failed to fetch pending venues');
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: allVenues, isLoading: allVenuesLoading } = useQuery<VenueWithDetails[]>({
    queryKey: ['/api/admin/venues'],
    queryFn: async () => {
      const response = await fetch('/api/admin/venues');
      if (!response.ok) throw new Error('Failed to fetch all venues');
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ['/api/admin/bookings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const approveVenueMutation = useMutation({
    mutationFn: async (venueId: string) => {
      const response = await fetch(`/api/admin/venues/${venueId}/approve`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to approve venue');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/venues'] });
      toast({
        title: "Venue Approved",
        description: "The venue has been approved and is now live.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const rejectVenueMutation = useMutation({
    mutationFn: async (venueId: string) => {
      const response = await fetch(`/api/admin/venues/${venueId}/reject`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to reject venue');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/venues'] });
      toast({
        title: "Venue Rejected",
        description: "The venue has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  if (authLoading || pendingLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

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
              <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Logged in as Admin</span>
              <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-destructive-foreground text-sm font-medium">A</span>
              </div>
            </div>
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
                  <p className="text-sm text-muted-foreground">Pending Venues</p>
                  <p className="text-2xl font-bold text-secondary">
                    {stats?.pendingVenues || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clock text-secondary"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Venues</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.totalVenues || 0}
                  </p>
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
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.totalBookings || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-calendar-check text-accent"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-blue-600"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Approvals ({pendingVenues?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="venues">All Venues</TabsTrigger>
            <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Venue Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingVenues && pendingVenues.length > 0 ? (
                  <div className="space-y-6">
                    {pendingVenues.map((venue) => (
                      <div key={venue.id} className="border border-border rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-20 h-20 rounded-xl bg-muted flex-shrink-0 bg-cover bg-center">
                            {venue.images?.[0] ? (
                              <img 
                                src={venue.images[0].path}
                                alt={venue.title}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <i className="fas fa-building text-xl text-primary"></i>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                  {venue.title}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  Submitted by {venue.host.firstName} {venue.host.lastName} • {venue.address}, {venue.city}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(venue.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                              {venue.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>
                                  <i className="fas fa-users mr-1"></i>Up to {venue.capacity} people
                                </span>
                                <span>
                                  <i className="fas fa-tag mr-1"></i>₪{venue.baseHourlyPriceEGP}/hour
                                </span>
                                <span>
                                  <i className="fas fa-images mr-1"></i>{venue.images?.length || 0} photos
                                </span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => rejectVenueMutation.mutate(venue.id)}
                                  disabled={rejectVenueMutation.isPending}
                                  data-testid={`reject-venue-${venue.id}`}
                                >
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => approveVenueMutation.mutate(venue.id)}
                                  disabled={approveVenueMutation.isPending}
                                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                                  data-testid={`approve-venue-${venue.id}`}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setLocation(`/venues/${venue.id}`)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <i className="fas fa-check-circle text-4xl text-accent mb-4"></i>
                    <h3 className="text-xl font-semibold text-foreground mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">
                      No venues pending approval at the moment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="venues">
            <Card>
              <CardHeader>
                <CardTitle>All Venues</CardTitle>
              </CardHeader>
              <CardContent>
                {allVenues && allVenues.length > 0 ? (
                  <div className="space-y-4">
                    {allVenues.slice(0, 20).map((venue) => (
                      <div 
                        key={venue.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0">
                            {venue.images?.[0] ? (
                              <img 
                                src={venue.images[0].path}
                                alt={venue.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <i className="fas fa-building text-primary"></i>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{venue.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {venue.host.firstName} {venue.host.lastName} • {venue.city}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(venue.status)}
                          <span className="text-sm text-muted-foreground">
                            ₪{venue.baseHourlyPriceEGP}/hour
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <i className="fas fa-building text-4xl text-muted-foreground mb-4"></i>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No venues yet</h3>
                    <p className="text-muted-foreground">
                      Venues will appear here when hosts start listing them.
                    </p>
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
                    {bookings.slice(0, 20).map((booking) => (
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
                      Bookings will appear here when guests start making reservations.
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
