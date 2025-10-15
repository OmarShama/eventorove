import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

// Import our components
import ImageGallery, { VenueImage } from '@/components/ImageGallery';
import ImageUploader from '@/components/ImageUploader';
import ImageEditor from '@/components/ImageEditor';

// Mock data - replace with actual API calls
const mockImages: VenueImage[] = [
  {
    id: '1',
    path: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    alt: 'Main conference room with modern setup',
    caption: 'Main Conference Room - Perfect for presentations and meetings',
    isMain: true,
    order: 1,
    size: 2048576,
    width: 1920,
    height: 1080,
    uploadedAt: '2024-01-10T09:00:00Z',
  },
  {
    id: '2',
    path: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop',
    alt: 'Breakout area with comfortable seating',
    caption: 'Comfortable Breakout Area - Ideal for informal discussions',
    isMain: false,
    order: 2,
    size: 1572864,
    width: 1600,
    height: 1200,
    uploadedAt: '2024-01-10T10:30:00Z',
  },
  {
    id: '3',
    path: 'https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=800&h=600&fit=crop',
    alt: 'Reception and entrance area',
    caption: 'Welcoming Reception Area - First impression for your guests',
    isMain: false,
    order: 3,
    size: 1888256,
    width: 1800,
    height: 1350,
    uploadedAt: '2024-01-10T11:15:00Z',
  },
  {
    id: '4',
    path: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
    alt: 'Kitchen and catering facilities',
    caption: 'Full Kitchen Facilities - Available for catered events',
    isMain: false,
    order: 4,
    size: 2234567,
    width: 1920,
    height: 1280,
    uploadedAt: '2024-01-11T14:20:00Z',
  },
  {
    id: '5',
    path: 'https://images.unsplash.com/photo-1571624436279-b272afd79d9f?w=800&h=600&fit=crop',
    alt: 'Outdoor terrace space',
    caption: 'Outdoor Terrace - Perfect for networking breaks and events',
    isMain: false,
    order: 5,
    size: 1956789,
    width: 1600,
    height: 1067,
    uploadedAt: '2024-01-12T16:45:00Z',
  },
];

export default function VenueImages() {
  const router = useRouter();
  const { venueId } = router.query;
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<VenueImage | null>(null);

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

  const { data: images = mockImages, isLoading: imagesLoading } = useQuery({
    queryKey: ['venue-images', venueId],
    queryFn: () => Promise.resolve(mockImages),
    enabled: !!venueId,
  });

  // Mutations for managing images
  const uploadImagesMutation = useMutation({
    mutationFn: async (uploadData: Array<{ file: File; caption?: string; alt?: string; isMain?: boolean }>) => {
      // Mock implementation - simulate upload
      console.log('Uploading images:', uploadData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create mock response
      const newImages: VenueImage[] = uploadData.map((data, index) => ({
        id: Date.now().toString() + index,
        path: URL.createObjectURL(data.file), // In real app, this would be the uploaded URL
        alt: data.alt,
        caption: data.caption,
        isMain: data.isMain || false,
        order: images.length + index + 1,
        size: data.file.size,
        width: 1600,
        height: 1200,
        uploadedAt: new Date().toISOString(),
      }));

      return newImages;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-images', venueId] });
      toast({
        title: "Images Uploaded",
        description: "Your images have been uploaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: async (data: { imageId: string; updates: Partial<VenueImage> }) => {
      // Mock implementation
      console.log('Updating image:', data);
      await new Promise(resolve => setTimeout(resolve, 500));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-images', venueId] });
      toast({
        title: "Image Updated",
        description: "The image has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      // Mock implementation
      console.log('Deleting image:', imageId);
      await new Promise(resolve => setTimeout(resolve, 500));
      return imageId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-images', venueId] });
      toast({
        title: "Image Deleted",
        description: "The image has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const reorderImageMutation = useMutation({
    mutationFn: async (data: { imageId: string; newOrder: number }) => {
      // Mock implementation
      console.log('Reordering image:', data);
      await new Promise(resolve => setTimeout(resolve, 300));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-images', venueId] });
      toast({
        title: "Order Updated",
        description: "The image order has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reorder Failed",
        description: error.message || "Failed to update image order.",
        variant: "destructive",
      });
    },
  });

  const setMainImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      // Mock implementation
      console.log('Setting main image:', imageId);
      await new Promise(resolve => setTimeout(resolve, 300));
      return imageId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-images', venueId] });
      toast({
        title: "Main Image Set",
        description: "The main venue image has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to set main image.",
        variant: "destructive",
      });
    },
  });

  // Handler functions
  const handleUpload = () => {
    setIsUploaderOpen(true);
  };

  const handleUploadComplete = (uploadData: Array<{ file: File; caption?: string; alt?: string; isMain?: boolean }>) => {
    uploadImagesMutation.mutate(uploadData);
  };

  const handleEdit = (image: VenueImage) => {
    setSelectedImage(image);
    setIsEditorOpen(true);
  };

  const handleSaveEdit = (imageId: string, updates: Partial<VenueImage>) => {
    updateImageMutation.mutate({ imageId, updates });
  };

  const handleDelete = (imageId: string) => {
    deleteImageMutation.mutate(imageId);
  };

  const handleReorder = (imageId: string, newOrder: number) => {
    reorderImageMutation.mutate({ imageId, newOrder });
  };

  const handleSetMain = (imageId: string) => {
    setMainImageMutation.mutate(imageId);
  };


  if (authLoading || venueLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading image management...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Image Management</h1>
              <p className="text-gray-600 mt-2">
                Upload and manage photos to showcase your venue
              </p>
              {venue && (
                <p className="text-sm text-gray-500 mt-1">
                  Venue: {venue.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <ImageGallery
          images={images}
          onReorder={handleReorder}
          onSetMain={handleSetMain}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpload={handleUpload}
          isLoading={imagesLoading}
          maxImages={20}
        />

        {/* Image Uploader Modal */}
        <ImageUploader
          isOpen={isUploaderOpen}
          onClose={() => setIsUploaderOpen(false)}
          onUpload={handleUploadComplete}
          maxFiles={20}
          maxFileSize={5 * 1024 * 1024} // 5MB
          acceptedFileTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
          existingImageCount={images.length}
        />

        {/* Image Editor Modal */}
        <ImageEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedImage(null);
          }}
          onSave={handleSaveEdit}
          image={selectedImage}
          maxOrder={images.length}
          canSetMain={true}
        />
      </div>
    </div>
  );
}
