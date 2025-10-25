import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Edit,
    MapPin,
    Users,
    Clock,
    DollarSign,
    Image,
    CheckCircle,
    XCircle,
    AlertCircle,
    Building2,
    ChevronLeft,
    ChevronRight,
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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    const nextImage = () => {
        if (venue?.images && venue.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % venue.images.length);
        }
    };

    const prevImage = () => {
        if (venue?.images && venue.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + venue.images.length) % venue.images.length);
        }
    };

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
                                    {venue.address}, {venue.city}
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

                {/* Image Slider */}
                {venue.images && venue.images.length > 0 ? (
                    <Card className="mb-8">
                        <CardContent className="p-0">
                            <div className="relative h-96 rounded-lg overflow-hidden">
                                <img
                                    src={venue.images[currentImageIndex]?.path || "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"}
                                    alt={venue.title}
                                    className="w-full h-full object-cover"
                                />

                                {venue.images.length > 1 && (
                                    <>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>

                                        {/* Image indicators */}
                                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                            {venue.images.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="mb-8">
                        <CardContent className="p-0">
                            <div className="relative h-96 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                                <div className="text-center">
                                    <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No images available</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Venue Details */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Information */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Venue Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
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

                            {venue.packages && venue.packages.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-4">Packages</h4>
                                    <div className="space-y-4">
                                        {venue.packages.map((pkg) => (
                                            <div key={pkg.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="font-medium">{pkg.name}</h5>
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
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sidebar Information */}
                    <div className="space-y-6">
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
                                <div className="space-y-3">
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
            </div>
        </div>
    );
}
