import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { VenueWithDetails } from "@/types/api";
import { getWithAuth, patchWithAuth } from "@/lib/authUtils";

export default function VenueApprovalPage() {
    const router = useRouter();
    const { id } = router.query;
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
            router.push('/');
        }
    }, [authLoading, isAuthenticated, user, toast, router]);

    const { data: venue, isLoading, error } = useQuery<VenueWithDetails>({
        queryKey: ['/api/venues', id],
        queryFn: () => getWithAuth(`/api/venues/${id}`),
        enabled: !!id && isAuthenticated && user?.role === 'admin',
    });

    const approveVenueMutation = useMutation({
        mutationFn: () => patchWithAuth(`/api/admin/venues/${id}/approve`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/venues'] });
            queryClient.invalidateQueries({ queryKey: ['/api/venues', id] });
            toast({
                title: "Venue Approved",
                description: "The venue has been approved and is now live.",
            });
            router.push('/admin/dashboard');
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
        mutationFn: () => patchWithAuth(`/api/admin/venues/${id}/reject`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/venues'] });
            queryClient.invalidateQueries({ queryKey: ['/api/venues', id] });
            toast({
                title: "Venue Rejected",
                description: "The venue has been rejected.",
            });
            router.push('/admin/dashboard');
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: "destructive",
            });
        },
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
            case 'pending_approval':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
            case 'draft':
                return <Badge variant="secondary">Draft</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !venue) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Venue Not Found</h1>
                    <p className="text-gray-600 mb-4">The venue you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
                    <Button onClick={() => router.push('/admin/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/admin/dashboard')}
                                data-testid="back-to-dashboard"
                            >
                                <i className="fas fa-arrow-left"></i>
                            </Button>
                            <h1 className="text-2xl font-semibold text-foreground">Venue Approval</h1>
                            {getStatusBadge(venue.status)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Venue Details */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{venue.title}</CardTitle>
                                <p className="text-muted-foreground">{venue.category} in {venue.city}</p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="text-gray-600">{venue.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Address</h3>
                                        <p className="text-gray-600">{venue.address}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Capacity</h3>
                                        <p className="text-gray-600">{venue.capacity} people</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Base Price</h3>
                                        <p className="text-gray-600">{venue.baseHourlyPriceEGP} EGP/hour</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Min Booking</h3>
                                        <p className="text-gray-600">{venue.minBookingMinutes} minutes</p>
                                    </div>
                                </div>

                                {venue.amenities && venue.amenities.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Amenities</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {venue.amenities.map((amenity, index) => (
                                                <Badge key={index} variant="outline">{amenity.name}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="font-semibold mb-2">Host Information</h3>
                                    <p className="text-gray-600">
                                        {venue.host.firstName} {venue.host.lastName} ({venue.host.email})
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions Panel */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Approval Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {venue.status === 'pending_approval' && (
                                    <>
                                        <Button
                                            onClick={() => approveVenueMutation.mutate()}
                                            disabled={approveVenueMutation.isPending}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                        >
                                            {approveVenueMutation.isPending ? 'Approving...' : 'Approve Venue'}
                                        </Button>
                                        <Button
                                            onClick={() => rejectVenueMutation.mutate()}
                                            disabled={rejectVenueMutation.isPending}
                                            variant="destructive"
                                            className="w-full"
                                        >
                                            {rejectVenueMutation.isPending ? 'Rejecting...' : 'Reject Venue'}
                                        </Button>
                                    </>
                                )}

                                {venue.status === 'approved' && (
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <i className="fas fa-check-circle text-green-600 text-2xl mb-2"></i>
                                        <p className="text-green-800 font-medium">This venue is already approved</p>
                                    </div>
                                )}

                                {venue.status === 'rejected' && (
                                    <div className="text-center p-4 bg-red-50 rounded-lg">
                                        <i className="fas fa-times-circle text-red-600 text-2xl mb-2"></i>
                                        <p className="text-red-800 font-medium">This venue has been rejected</p>
                                        <Button
                                            onClick={() => approveVenueMutation.mutate()}
                                            disabled={approveVenueMutation.isPending}
                                            className="mt-2 bg-green-600 hover:bg-green-700"
                                            size="sm"
                                        >
                                            {approveVenueMutation.isPending ? 'Approving...' : 'Approve Anyway'}
                                        </Button>
                                    </div>
                                )}

                                <div className="pt-4 border-t">
                                    <div className="text-sm text-gray-500">
                                        <p>Created: {new Date(venue.createdAt).toLocaleDateString()}</p>
                                        <p>Updated: {new Date(venue.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
