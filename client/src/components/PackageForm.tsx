import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import {
  Package,
  Plus,
  Trash2,
  DollarSign,
  Clock,
  Users,
  Star,
  List
} from 'lucide-react';
import { VenuePackage } from './PackageCard';

const packageSchema = z.object({
  name: z.string().min(1, "Package name is required").max(100, "Name too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description too long"),
  priceEGP: z.number().min(1, "Price must be at least 1 EGP"),
  durationMinutes: z.number().min(30, "Duration must be at least 30 minutes"),
  maxGuests: z.number().min(1, "Must accommodate at least 1 guest").optional(),
  isPopular: z.boolean(),
  isActive: z.boolean(),
  features: z.array(z.object({
    name: z.string().min(1, "Feature name is required")
  })).min(1, "At least one feature is required"),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PackageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (packageData: Omit<PackageFormData, 'features'> & { features: string[] }) => void;
  initialData?: Partial<VenuePackage>;
  isEditing?: boolean;
}

// Common package durations in minutes
const DURATION_OPTIONS = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 },
  { label: '6 hours', value: 360 },
  { label: '8 hours', value: 480 },
  { label: 'Full day (12 hours)', value: 720 },
];

export default function PackageForm({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: PackageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customDuration, setCustomDuration] = useState(false);

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: '',
      description: '',
      priceEGP: 500,
      durationMinutes: 120,
      maxGuests: undefined,
      isPopular: false,
      isActive: true,
      features: [{ name: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'features',
  });

  // Populate form when editing
  useEffect(() => {
    if (initialData && isOpen) {
      form.reset({
        name: initialData.name || '',
        description: initialData.description || '',
        priceEGP: initialData.priceEGP || 500,
        durationMinutes: initialData.durationMinutes || 120,
        maxGuests: initialData.maxGuests,
        isPopular: initialData.isPopular || false,
        isActive: initialData.isActive ?? true,
        features: initialData.features?.map(f => ({ name: f })) || [{ name: '' }],
      });

      // Check if we need custom duration
      const standardDuration = DURATION_OPTIONS.find(opt => opt.value === initialData.durationMinutes);
      setCustomDuration(!standardDuration);
    }
  }, [initialData, isOpen, form]);

  const handleSubmit = async (data: PackageFormData) => {
    setIsSubmitting(true);
    try {
      // Transform features array from objects to strings
      const transformedData = {
        ...data,
        features: data.features.map(f => f.name).filter(name => name.trim() !== ''),
      };

      await onSave(transformedData);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error saving package:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFeature = () => {
    append({ name: '' });
  };

  const removeFeature = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleDurationChange = (value: string) => {
    const numValue = parseInt(value);
    if (numValue === 0) {
      setCustomDuration(true);
    } else {
      setCustomDuration(false);
      form.setValue('durationMinutes', numValue);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEditing ? 'Edit Package' : 'Create New Package'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update package details and features.' : 'Create a new package for your venue with custom pricing and features.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Standard Meeting Package, Premium Event Package"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what's included in this package..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing and Duration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing & Duration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="priceEGP"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (EGP) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="500"
                            className="pl-10"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <div className="text-sm text-muted-foreground">
                        Display price: {formatPrice(form.watch('priceEGP') || 0)} EGP
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">Duration *</label>
                  <div className="space-y-3">
                    <select
                      onChange={(e) => handleDurationChange(e.target.value)}
                      value={customDuration ? '0' : form.watch('durationMinutes')?.toString() || '120'}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {DURATION_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                      <option value="0">Custom duration</option>
                    </select>

                    {customDuration && (
                      <FormField
                        control={form.control}
                        name="durationMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  placeholder="120"
                                  className="pl-10"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="maxGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Guests (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="Leave empty for no limit"
                            className="pl-10"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Package Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`features.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder={`Feature ${index + 1}...`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        disabled={fields.length === 1}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFeature}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </CardContent>
            </Card>

            {/* Package Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Package Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isPopular"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Popular Package
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Mark this as a popular package to highlight it to customers
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

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Package</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Only active packages are available for booking
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
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Package' : 'Create Package'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
