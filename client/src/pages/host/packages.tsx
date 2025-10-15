import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

// Import our components
import PackageList from '@/components/PackageList';
import PackageForm from '@/components/PackageForm';
import { VenuePackage } from '@/components/PackageCard';

// Mock data - replace with actual API calls
const mockPackages: VenuePackage[] = [
  {
    id: '1',
    name: 'Standard Meeting Package',
    description: 'Perfect for small business meetings and team collaborations. Includes basic AV setup and refreshments.',
    priceEGP: 500,
    durationMinutes: 120,
    maxGuests: 10,
    isPopular: false,
    isActive: true,
    features: [
      'Basic AV equipment (projector, screen)',
      'Whiteboard and markers',
      'Coffee and tea service',
      'Free WiFi',
      'Basic room setup'
    ],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
  },
  {
    id: '2',
    name: 'Premium Event Package',
    description: 'Our most popular package for important presentations and client meetings. Features premium amenities and dedicated support.',
    priceEGP: 1200,
    durationMinutes: 240,
    maxGuests: 25,
    isPopular: true,
    isActive: true,
    features: [
      'Premium AV equipment (4K projector, sound system)',
      'Interactive whiteboard',
      'Catered lunch or dinner',
      'Dedicated event coordinator',
      'Professional room setup',
      'Recording equipment available',
      'Welcome reception area'
    ],
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-20T16:45:00Z',
  },
  {
    id: '3',
    name: 'Workshop Package',
    description: 'Designed for training sessions and workshops. Flexible setup with breakout areas and collaborative tools.',
    priceEGP: 800,
    durationMinutes: 360,
    maxGuests: 20,
    isPopular: false,
    isActive: true,
    features: [
      'Flexible room configuration',
      'Breakout areas',
      'Flip charts and supplies',
      'AV equipment for presentations',
      'Light refreshments',
      'Collaborative workspace tools'
    ],
    createdAt: '2024-01-12T08:30:00Z',
    updatedAt: '2024-01-12T08:30:00Z',
  },
  {
    id: '4',
    name: 'Executive Boardroom',
    description: 'Luxury boardroom experience for high-level executive meetings. Premium amenities and professional service.',
    priceEGP: 2000,
    durationMinutes: 180,
    maxGuests: 12,
    isPopular: false,
    isActive: false,
    features: [
      'Luxury leather seating',
      'Executive conference table',
      'Premium AV with video conferencing',
      'Concierge service',
      'Gourmet catering options',
      'Private entrance',
      'Administrative support'
    ],
    createdAt: '2024-01-05T10:15:00Z',
    updatedAt: '2024-01-25T13:20:00Z',
  },
];

export default function VenuePackages() {
  const router = useRouter();
  const { venueId } = router.query;
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<VenuePackage | null>(null);

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
  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ['venue', venueId],
    queryFn: () => Promise.resolve({
      id: venueId,
      title: 'Sample Venue',
      description: 'A sample venue for demonstration',
    }),
    enabled: !!venueId && isAuthenticated,
  });

  const { data: packages = mockPackages, isLoading: packagesLoading } = useQuery({
    queryKey: ['venue-packages', venueId],
    queryFn: () => Promise.resolve(mockPackages),
    enabled: !!venueId,
  });

  // Mutations for managing packages
  const createPackageMutation = useMutation({
    mutationFn: async (packageData: any) => {
      // Mock implementation
      console.log('Creating package:', packageData);
      const newPackage: VenuePackage = {
        id: Date.now().toString(),
        ...packageData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return Promise.resolve(newPackage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-packages', venueId] });
      toast({
        title: "Package Created",
        description: "The package has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create package",
        variant: "destructive",
      });
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: async (data: { id: string; packageData: any }) => {
      // Mock implementation
      console.log('Updating package:', data);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-packages', venueId] });
      toast({
        title: "Package Updated",
        description: "The package has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update package",
        variant: "destructive",
      });
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation
      console.log('Deleting package:', id);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-packages', venueId] });
      toast({
        title: "Package Deleted",
        description: "The package has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete package",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (data: { id: string; isActive: boolean }) => {
      // Mock implementation
      console.log('Toggling package status:', data);
      return Promise.resolve();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venue-packages', venueId] });
      toast({
        title: variables.isActive ? "Package Activated" : "Package Deactivated",
        description: `The package has been ${variables.isActive ? 'activated' : 'deactivated'} successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update package status",
        variant: "destructive",
      });
    },
  });

  // Handler functions
  const handleAdd = () => {
    setEditingPackage(null);
    setIsFormOpen(true);
  };

  const handleEdit = (packageData: VenuePackage) => {
    setEditingPackage(packageData);
    setIsFormOpen(true);
  };

  const handleSave = (packageData: any) => {
    if (editingPackage) {
      updatePackageMutation.mutate({ id: editingPackage.id, packageData });
    } else {
      createPackageMutation.mutate(packageData);
    }
  };

  const handleDelete = (id: string) => {
    deletePackageMutation.mutate(id);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive });
  };

  const handleView = (packageData: VenuePackage) => {
    // Could navigate to a detailed view or open a modal
    console.log('Viewing package:', packageData);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPackage(null);
  };

  if (authLoading || venueLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading package management...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Package Management</h1>
              <p className="text-gray-600 mt-2">
                Create and manage pricing packages for your venue
              </p>
              {venue && (
                <p className="text-sm text-gray-500 mt-1">
                  Venue: {venue.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Package List */}
        <PackageList
          packages={packages}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onView={handleView}
          isLoading={packagesLoading}
        />

        {/* Package Form Modal */}
        <PackageForm
          isOpen={isFormOpen}
          onClose={closeForm}
          onSave={handleSave}
          initialData={editingPackage as Partial<VenuePackage>}
          isEditing={!!editingPackage}
        />
      </div>
    </div>
  );
}
