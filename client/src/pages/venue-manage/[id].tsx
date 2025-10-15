import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft,
    Edit,
    MapPin,
    Users,
    Clock,
    DollarSign,
    Calendar,
    Image,
    CheckCircle,
    XCircle,
    AlertCircle,
    Building2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { venueApi, adminApi } from '@/lib/api';
import { VenueWithDetails } from '@/types/api';

export default function VenueManagement() {
    const router = useRouter();
    const { id } = router.query;
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Redirect if not authenticated or not admin/host
    useEffect(() => {
        if (!authLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'host'))) {
            toast({
                title: "Access Denied",
                description: "You need admin or host privileges to access this page.",
                variant: "destructive",
            });
            router.push('/');
        }
    }, [authLoading, isAuthenticated, user, toast, router]);

    const { data: venueData, isLoading, error } = useQuery({
        queryKey: ['venue', id],
        queryFn: () => venueApi.getById(id as string),
        enabled: !!id && isAuthenticated && (user?.role === 'admin' || user?.role === 'host'),
    });

    const venue: VenueWithDetails = (venueData as any)?.data || null;

    const approveVenueMutation = useMutation({
        mutationFn: (venueId: string) => adminApi.approveVenue(venueId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['venue', id] });
            toast({
                title: "Success",
                description: "Venue approved successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to approve venue",
                variant: "destructive",
            });
        },
    });

    const rejectVenueMutation = useMutation({
        mutationFn: (venueId: string) => adminApi.rejectVenue(venueId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['venue', id] });
            toast({
                title: "Success",
                description: "Venue rejected successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to reject venue",
                variant: "destructive",
            });
        },
    });

    const handleEdit = () => {
        router.push(`/host/venues/${id}/edit`);
    };

    const handleApprove = () => {
        if (venue?.id) {
            approveVenueMutation.mutate(venue.id);
        }
    };

    const handleReject = () => {
        if (venue?.id) {
            rejectVenueMutation.mutate(venue.id);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
            pending_approval: { variant: 'secondary' as const, icon: AlertCircle, color: 'text-yellow-600' },
            rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
            draft: { variant: 'outline' as const, icon: Edit, color: 'text-gray-600' },
        };

        const config = variants[status as keyof typeof variants] || variants.draft;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className={`h-3 w-3 ${config.color}`} />
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </Badge>
        );
    };

    const canEdit = user?.role === 'admin' || (user?.role === 'host' && venue?.host?.id === user.id);
    const canApprove = user?.role === 'admin' && venue?.status === 'pending_approval';

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !venue) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                    <CardContent className="text-center py-8">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Venue Not Found</h3>
                        <p className="text-gray-600 mb-4">The venue you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
                        <Button onClick={() => router.back()}>Go Back</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'host')) {
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
                            onClick={() => router.back()}
                            className="flex items-center space-x-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back</span>
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl font-bold text-gray-900 truncate">{venue.title}</h1>
                            <div className="flex items-center space-x-4 mt-2">
                                {getStatusBadge(venue.status)}
                                <span className="text-gray-600 flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {venue.city}
                                </span>
                            </div>
                        </div>

                        <div className="flex space-x-2 mt-4 sm:mt-0">
                            {canApprove && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleReject}
                                        disabled={rejectVenueMutation.isPending}
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={handleApprove}
                                        disabled={approveVenueMutation.isPending}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                </>
                            )}
                            {canEdit && (
                                <Button onClick={handleEdit} className="flex items-center space-x-2">
                                    <Edit className="h-4 w-4" />
                                    <span>Edit Venue</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="images">Images</TabsTrigger>
                        <TabsTrigger value="pricing">Pricing & Packages</TabsTrigger>
                        <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            {/* Basic Info */}
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Venue Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                        <p className="text-gray-600">{venue.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Category</h4>
                                            <Badge variant="secondary">{venue.category}</Badge>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Capacity</h4>
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Users className="h-4 w-4" />
                                                {venue.capacity} people
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                                        <div className="flex items-start gap-2 text-gray-600">
                                            <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                                            <span>{venue.address}, {venue.city}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Amenities</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {venue.amenities && venue.amenities.length > 0 ? (
                                                venue.amenities.map((amenity) => (
                                                    <Badge key={amenity.id} variant="outline">
                                                        {amenity.name}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-gray-500">No amenities listed</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Host Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center space-x-3">
                                            {venue.host?.profileImageUrl ? (
                                                <img
                                                    src={venue.host.profileImageUrl}
                                                    alt={`${venue.host.firstName} ${venue.host.lastName}`}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-gray-500" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {venue.host?.firstName} {venue.host?.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">{venue.host?.email}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Pricing</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Base Rate</span>
                                                <span className="font-medium flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    {venue.baseHourlyPriceEGP}/hour
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Min Booking</span>
                                                <span className="font-medium flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {venue.minBookingMinutes} min
                                                </span>
                                            </div>
                                            {venue.maxBookingMinutes && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Max Booking</span>
                                                    <span className="font-medium flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {venue.maxBookingMinutes} min
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Created</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-gray-600">
                                            {new Date(venue.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="images" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Image className="h-5 w-5" />
                                    Venue Images
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {venue.images && venue.images.length > 0 ? (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {venue.images.map((image) => (
                                            <div key={image.id} className="relative group">
                                                <img
                                                    src={image.path}
                                                    alt="Venue"
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No images uploaded</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pricing" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Packages</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {venue.packages && venue.packages.length > 0 ? (
                                    <div className="space-y-4">
                                        {venue.packages.map((pkg) => (
                                            <div key={pkg.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-semibold">{pkg.name}</h4>
                                                    <Badge variant="outline">
                                                        ${pkg.priceEGP}
                                                    </Badge>
                                                </div>
                                                <p className="text-gray-600 text-sm mb-2">{pkg.description}</p>
                                                <div className="text-sm text-gray-500">
                                                    Duration: {pkg.durationMinutes} minutes
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No packages configured</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="bookings" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Recent Bookings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Booking data will be implemented in future updates</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
