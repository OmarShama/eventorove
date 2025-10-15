import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Image as ImageIcon, 
  Star,
  ArrowUp,
  ArrowDown,
  Hash
} from 'lucide-react';
import { VenueImage } from './ImageGallery';

const imageEditSchema = z.object({
  caption: z.string().max(200, "Caption must be less than 200 characters").optional(),
  alt: z.string().max(150, "Alt text must be less than 150 characters").optional(),
  order: z.number().min(1, "Order must be at least 1"),
  isMain: z.boolean(),
});

type ImageEditFormData = z.infer<typeof imageEditSchema>;

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageId: string, updates: Partial<VenueImage>) => void;
  image: VenueImage | null;
  maxOrder: number;
  canSetMain?: boolean;
}

export default function ImageEditor({
  isOpen,
  onClose,
  onSave,
  image,
  maxOrder,
  canSetMain = true,
}: ImageEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ImageEditFormData>({
    resolver: zodResolver(imageEditSchema),
    defaultValues: {
      caption: '',
      alt: '',
      order: 1,
      isMain: false,
    },
  });

  // Populate form when image changes
  useEffect(() => {
    if (image && isOpen) {
      form.reset({
        caption: image.caption || '',
        alt: image.alt || '',
        order: image.order,
        isMain: image.isMain,
      });
    }
  }, [image, isOpen, form]);

  const handleSubmit = async (data: ImageEditFormData) => {
    if (!image) return;

    setIsSubmitting(true);
    try {
      await onSave(image.id, {
        caption: data.caption || undefined,
        alt: data.alt || undefined,
        order: data.order,
        isMain: data.isMain,
      });
      onClose();
    } catch (error) {
      console.error('Error updating image:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const adjustOrder = (direction: 'up' | 'down') => {
    const currentOrder = form.getValues('order');
    const newOrder = direction === 'up' ? Math.min(currentOrder + 1, maxOrder) : Math.max(currentOrder - 1, 1);
    form.setValue('order', newOrder);
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

  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Image Details
            {image.isMain && (
              <Badge className="bg-yellow-500 hover:bg-yellow-600">
                <Star className="h-3 w-3 mr-1" />
                Main Image
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Update the caption, alt text, and display order for this image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Image Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Image */}
                <div className="rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.path}
                    alt={image.alt || image.caption || 'Venue image'}
                    className="w-full h-64 object-cover"
                  />
                </div>

                {/* Image Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Size:</span>
                    <p className="text-gray-600">{formatFileSize(image.size)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Dimensions:</span>
                    <p className="text-gray-600">{getImageDimensions(image)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Order:</span>
                    <p className="text-gray-600">#{image.order}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Uploaded:</span>
                    <p className="text-gray-600">{new Date(image.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Image Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {/* Caption */}
                  <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caption (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of what's shown in this image..."
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          {(field.value || '').length}/200 characters
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Alt Text */}
                  <FormField
                    control={form.control}
                    name="alt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alt Text (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Accessibility description for screen readers..."
                            {...field}
                          />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          {(field.value || '').length}/150 characters • Used for accessibility
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Display Order */}
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                min={1}
                                max={maxOrder}
                                className="pl-10"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </div>
                            <div className="flex flex-col">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => adjustOrder('up')}
                                disabled={field.value >= maxOrder}
                                className="h-8 px-2"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => adjustOrder('down')}
                                disabled={field.value <= 1}
                                className="h-8 px-2"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          Lower numbers appear first (1 = first, {maxOrder} = last)
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Main Image Toggle */}
                  {canSetMain && (
                    <FormField
                      control={form.control}
                      name="isMain"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              Main Venue Image
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              The main image will be prominently displayed and used as the venue&apos;s primary photo
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-sm text-blue-800">
                <h4 className="font-medium mb-2">Tips for Better Images</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Write descriptive captions that help customers understand what they&apos;re seeing</li>
                  <li>• Alt text should describe the image content for accessibility (screen readers)</li>
                  <li>• Order images logically: main entrance first, then key areas, amenities, etc.</li>
                  <li>• The main image should be your best, most representative photo</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
