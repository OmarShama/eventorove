import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Image as ImageIcon,
  MoreVertical,
  Edit,
  Trash2,
  Star,
  Eye,
  ArrowLeft,
  ArrowRight,
  X,
  Upload,
  Grid,
  List as ListIcon,
  SortAsc,
} from 'lucide-react';

export interface VenueImage {
  id: string;
  path: string;
  alt?: string;
  caption?: string;
  isMain: boolean;
  order: number;
  size?: number;
  width?: number;
  height?: number;
  uploadedAt: string;
}

interface ImageGalleryProps {
  images: VenueImage[];
  onReorder: (imageId: string, newOrder: number) => void;
  onSetMain: (imageId: string) => void;
  onEdit: (image: VenueImage) => void;
  onDelete: (imageId: string) => void;
  onUpload: () => void;
  isLoading?: boolean;
  maxImages?: number;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'order' | 'date' | 'size';

export default function ImageGallery({
  images,
  onSetMain,
  onEdit,
  onDelete,
  onUpload,
  isLoading = false,
  maxImages = 20,
}: ImageGalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('order');
  const [selectedImage, setSelectedImage] = useState<VenueImage | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sort images
  const sortedImages = [...images].sort((a, b) => {
    switch (sortBy) {
      case 'order':
        return a.order - b.order;
      case 'date':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case 'size':
        return (b.size || 0) - (a.size || 0);
      default:
        return 0;
    }
  });

  const handleImageClick = (image: VenueImage, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev'
      ? (currentImageIndex - 1 + sortedImages.length) % sortedImages.length
      : (currentImageIndex + 1) % sortedImages.length;

    setCurrentImageIndex(newIndex);
    setSelectedImage(sortedImages[newIndex]);
  };

  const handleDelete = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (window.confirm(`Are you sure you want to delete this image${image?.caption ? ` "${image.caption}"` : ''}?`)) {
      await onDelete(imageId);
      if (isViewerOpen) {
        closeViewer();
      }
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getImageDimensions = (image: VenueImage) => {
    if (image.width && image.height) {
      return `${image.width} × ${image.height}`;
    }
    return 'Unknown dimensions';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Image Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Image Gallery
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {images.length} of {maxImages} images uploaded
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SortAsc className="h-4 w-4 mr-2" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('order')}>
                    By Order
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('date')}>
                    By Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('size')}>
                    By Size
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Mode */}
              <div className="flex rounded-lg border">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* Upload Button */}
              {images.length < maxImages && (
                <Button onClick={onUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No images uploaded</h3>
              <p className="text-muted-foreground mb-4">
                Upload high-quality images to showcase your venue to potential customers
              </p>
              <Button onClick={onUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Images
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {sortedImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => handleImageClick(image, index)}
                >
                  <img
                    src={image.path}
                    alt={image.alt || image.caption || 'Venue image'}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200" />

                  {/* Main image badge */}
                  {image.isMain && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">
                        <Star className="h-3 w-3 mr-1" />
                        Main
                      </Badge>
                    </div>
                  )}

                  {/* Order badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      #{image.order}
                    </Badge>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(image, index);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Size
                        </DropdownMenuItem>
                        {!image.isMain && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onSetMain(image.id);
                          }}>
                            <Star className="h-4 w-4 mr-2" />
                            Set as Main
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onEdit(image);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(image.id);
                        }} className="text-red-600 focus:text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Caption overlay */}
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm truncate">{image.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedImages.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleImageClick(image, sortedImages.indexOf(image))}
                >
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 mr-4">
                    <img
                      src={image.path}
                      alt={image.alt || image.caption || 'Venue image'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">
                        {image.caption || `Image ${image.order}`}
                      </h4>
                      {image.isMain && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">
                          <Star className="h-3 w-3 mr-1" />
                          Main
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatFileSize(image.size)} • {getImageDimensions(image)} • Uploaded {new Date(image.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{image.order}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!image.isMain && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onSetMain(image.id);
                          }}>
                            <Star className="h-4 w-4 mr-2" />
                            Set as Main
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onEdit(image);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(image.id);
                        }} className="text-red-600 focus:text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={closeViewer}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>
                  {selectedImage?.caption || `Image ${selectedImage?.order}`}
                  {selectedImage?.isMain && (
                    <Badge className="ml-2 bg-yellow-500 hover:bg-yellow-600">
                      <Star className="h-3 w-3 mr-1" />
                      Main
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {selectedImage && (
                    <>
                      {formatFileSize(selectedImage.size)} • {getImageDimensions(selectedImage)} •
                      Uploaded {new Date(selectedImage.uploadedAt).toLocaleDateString()}
                    </>
                  )}
                </DialogDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={closeViewer}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedImage && (
            <div className="relative">
              <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={selectedImage.path}
                  alt={selectedImage.alt || selectedImage.caption || 'Venue image'}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>

              {/* Navigation */}
              {sortedImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={() => navigateImage('prev')}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => navigateImage('next')}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                {currentImageIndex + 1} of {sortedImages.length}
              </div>
              <div className="flex gap-2">
                {selectedImage && !selectedImage.isMain && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onSetMain(selectedImage.id);
                      closeViewer();
                    }}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Set as Main
                  </Button>
                )}
                {selectedImage && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onEdit(selectedImage);
                        closeViewer();
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(selectedImage.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
