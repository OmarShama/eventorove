import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDropzone } from 'react-dropzone';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { postWithAuth, isUnauthorizedError } from "@/lib/authUtils";
import { venueApi } from "@/lib/api";

const venueFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  category: z.string().min(1, "Category is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
  capacity: z.number().min(1, "Capacity must be at least 1").max(1000, "Capacity must be less than 1000"),
  baseHourlyPriceEGP: z.number().min(1, "Price must be at least 1 EGP"),
  minBookingMinutes: z.number().min(30, "Minimum booking must be at least 30 minutes").default(30),
  maxBookingMinutes: z.number().optional(),
  bufferMinutes: z.number().min(0, "Buffer minutes cannot be negative").default(30),
});

type VenueFormData = z.infer<typeof venueFormSchema>;

const categories = [
  "Meeting Rooms",
  "Event Halls",
  "Creative Studios",
  "Outdoor Spaces",
  "Conference Centers",
  "Workshops",
  "Co-working Spaces",
  "Party Venues",
];

const cities = [
  "New Cairo",
  "Heliopolis",
  "Zamalek",
  "Maadi",
  "Dokki",
  "Giza",
  "Nasr City",
  "Downtown Cairo",
];

export default function VenueForm() {
  const router = useRouter();
  const params = router.query;
  const { isAuthenticated, user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!params.id;

  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [availabilityRules, setAvailabilityRules] = useState<Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
  }>>([]);
  const [blackouts, setBlackouts] = useState<Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    reason: string;
  }>>([]);

  // Check authentication
  useEffect(() => {
    // Don't check until loading is complete
    if (isLoading) return;

    if (!isAuthenticated || (user?.role !== 'host' && user?.role !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "You need to be a host to create venues.",
        variant: "destructive",
      });
      router.push('/');
    }
  }, [isAuthenticated, user, isLoading, toast, router.push]);

  const form = useForm<VenueFormData>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      address: "",
      city: "",
      capacity: 10,
      baseHourlyPriceEGP: 500,
      minBookingMinutes: 30,
      bufferMinutes: 30,
    },
  });

  // Callback handlers for blackout changes to prevent re-rendering issues
  const handleBlackoutReasonChange = useCallback((index: number, value: string) => {
    setBlackouts(prev => {
      const newBlackouts = [...prev];
      newBlackouts[index].reason = value;
      return newBlackouts;
    });
  }, []);

  const handleBlackoutDayChange = useCallback((index: number, value: number) => {
    setBlackouts(prev => {
      const newBlackouts = [...prev];
      newBlackouts[index].dayOfWeek = value;
      return newBlackouts;
    });
  }, []);

  const handleBlackoutStartTimeChange = useCallback((index: number, value: string) => {
    setBlackouts(prev => {
      const newBlackouts = [...prev];
      newBlackouts[index].startTime = value;
      return newBlackouts;
    });
  }, []);

  const handleBlackoutEndTimeChange = useCallback((index: number, value: string) => {
    setBlackouts(prev => {
      const newBlackouts = [...prev];
      newBlackouts[index].endTime = value;
      return newBlackouts;
    });
  }, []);

  const removeBlackout = useCallback((index: number) => {
    setBlackouts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleImageUpload = useCallback((files: File[]) => {
    // Convert files to data URLs for preview
    files.forEach((file) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload only image files.",
          variant: "destructive",
        });
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload images smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setUploadedImages(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [toast]);

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleImageUpload,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 20 - uploadedImages.length,
  });

  // Fetch venue data for editing
  const { data: venueResponse, isLoading: venueLoading } = useQuery({
    queryKey: ['venues', params.id],
    queryFn: () => venueApi.getById(params.id as string),
    enabled: isEdit && !!params.id && typeof params.id === 'string',
  });

  const venue = (venueResponse as any)?.data;

  // Populate form when editing
  useEffect(() => {
    if (venue && isEdit && !venueLoading) {
      console.log('Populating form with venue data:', venue);

      // Parse numeric values safely
      const parseNumber = (value: any, defaultValue: number) => {
        if (value === null || value === undefined) return defaultValue;
        const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
        return isNaN(parsed) ? defaultValue : parsed;
      };

      form.reset({
        title: venue.title || "",
        description: venue.description || "",
        category: venue.category || "",
        address: venue.address || "",
        city: venue.city || "",
        capacity: parseNumber(venue.capacity, 10),
        baseHourlyPriceEGP: parseNumber(venue.baseHourlyPriceEGP, 500),
        minBookingMinutes: parseNumber(venue.minBookingMinutes, 30),
        maxBookingMinutes: venue.maxBookingMinutes ? parseNumber(venue.maxBookingMinutes, 60) : undefined,
        bufferMinutes: parseNumber(venue.bufferMinutes, 30),
        lat: venue.lat ? parseNumber(venue.lat, 0) : undefined,
        lng: venue.lng ? parseNumber(venue.lng, 0) : undefined,
      });

      if (venue.amenities && Array.isArray(venue.amenities)) {
        setAmenities(venue.amenities.map((a: any) => a.name || a));
      }

      if (venue.images && Array.isArray(venue.images)) {
        setUploadedImages(venue.images.map((img: any) => img.path || img.imageURL || img));
      }

      if (venue.availabilityRules && Array.isArray(venue.availabilityRules)) {
        setAvailabilityRules(venue.availabilityRules.map((rule: any) => ({
          dayOfWeek: rule.dayOfWeek,
          openTime: rule.openTime,
          closeTime: rule.closeTime,
        })));
      }

      if (venue.blackouts && Array.isArray(venue.blackouts)) {
        setBlackouts(venue.blackouts.map((blackout: any) => ({
          startDateTime: blackout.startDateTime,
          endDateTime: blackout.endDateTime,
          reason: blackout.reason,
        })));
      }
    }
  }, [venue, isEdit, form, venueLoading]);

  const createVenueMutation = useMutation({
    mutationFn: async (data: VenueFormData) => {
      // Prepare the complete venue data with all related entities
      const venueData = {
        ...data,
        images: uploadedImages.map((url, index) => ({
          imageUrl: url,
          displayOrder: index,
          isMain: index === 0,
        })),
        amenities: amenities.map(name => ({ name })),
        packages: [], // Add packages if needed in the future
        availabilityRules: availabilityRules.map(rule => ({
          dayOfWeek: rule.dayOfWeek,
          openTime: rule.openTime,
          closeTime: rule.closeTime,
          isAvailable: true,
        })),
        blackouts: blackouts.map(blackout => ({
          dayOfWeek: blackout.dayOfWeek,
          startTime: blackout.startTime,
          endTime: blackout.endTime,
          reason: blackout.reason,
        })),
      };

      return postWithAuth('/venues', venueData);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/host/venues'] });
      toast({
        title: "Venue Created",
        description: "Your venue has been submitted for review.",
      });
      router.push('/host/dashboard');
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to create a venue.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }

      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const updateVenueMutation = useMutation({
    mutationFn: async (data: VenueFormData) => {
      return venueApi.update(params.id as string, data);
    },
    onSuccess: async () => {
      try {
        // Update availability rules
        if (params.id) {
          for (const rule of availabilityRules) {
            await postWithAuth(`/venues/${params.id}/availability-rules`, rule);
          }

          // Update blackouts
          for (const blackout of blackouts) {
            await postWithAuth(`/venues/${params.id}/blackouts`, blackout);
          }
        }

        queryClient.invalidateQueries({ queryKey: ['/api/host/venues'] });
        queryClient.invalidateQueries({ queryKey: ['venues', params.id] });
        toast({
          title: "Venue Updated",
          description: "Your venue has been updated successfully.",
        });
        router.push('/host/dashboard');
      } catch (error) {
        console.error('Error updating venue details:', error);
        toast({
          title: "Venue Updated",
          description: "Your venue has been updated, but there was an issue updating some details.",
        });
        router.push('/host/dashboard');
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });


  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

  const onSubmit = (data: VenueFormData) => {
    if (isEdit) {
      updateVenueMutation.mutate(data);
    } else {
      createVenueMutation.mutate(data);
    }
  };

  if (!isAuthenticated || (user?.role !== 'host' && user?.role !== 'admin')) {
    return null;
  }

  // Show loading state when fetching venue data for editing
  if (isEdit && venueLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading venue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/host/dashboard')}
              data-testid="back-to-dashboard"
            >
              <i className="fas fa-arrow-left"></i>
            </Button>
            <h1 className="text-2xl font-semibold text-foreground">
              {isEdit ? 'Edit Venue' : 'List New Venue'}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Executive Conference Center"
                          data-testid="venue-title-input"
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
                          placeholder="Describe your venue, its features, and what makes it special..."
                          rows={4}
                          data-testid="venue-description-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="venue-category-select">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Maximum number of guests"
                            data-testid="venue-capacity-input"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Street address"
                          data-testid="venue-address-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="venue-city-select">
                            <SelectValue placeholder="Select a city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing & Booking Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Booking Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="baseHourlyPriceEGP"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate (EGP) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="500"
                          data-testid="venue-price-input"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="minBookingMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Booking (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            data-testid="venue-min-booking-input"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxBookingMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Booking (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Leave empty for no limit"
                            data-testid="venue-max-booking-input"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bufferMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buffer Time (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            data-testid="venue-buffer-input"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add an amenity (e.g., Wi-Fi, Parking)"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    data-testid="new-amenity-input"
                  />
                  <Button
                    type="button"
                    onClick={addAmenity}
                    data-testid="add-amenity-button"
                  >
                    Add
                  </Button>
                </div>

                {amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center space-x-1"
                      >
                        <span>{amenity}</span>
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="ml-1 hover:text-destructive"
                          data-testid={`remove-amenity-${index}`}
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Availability Management */}
            <Card>
              <CardHeader>
                <CardTitle>Availability Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Availability Rules */}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Weekly Availability</h3>
                  <div className="space-y-4">
                    {availabilityRules.map((rule, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <select
                            value={rule.dayOfWeek}
                            onChange={(e) => {
                              const newRules = [...availabilityRules];
                              newRules[index].dayOfWeek = parseInt(e.target.value);
                              setAvailabilityRules(newRules);
                            }}
                            className="w-full p-2 border border-input rounded-md"
                          >
                            <option value={0}>Sunday</option>
                            <option value={1}>Monday</option>
                            <option value={2}>Tuesday</option>
                            <option value={3}>Wednesday</option>
                            <option value={4}>Thursday</option>
                            <option value={5}>Friday</option>
                            <option value={6}>Saturday</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <input
                            type="time"
                            value={rule.openTime}
                            onChange={(e) => {
                              const newRules = [...availabilityRules];
                              newRules[index].openTime = e.target.value;
                              setAvailabilityRules(newRules);
                            }}
                            className="w-full p-2 border border-input rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="time"
                            value={rule.closeTime}
                            onChange={(e) => {
                              const newRules = [...availabilityRules];
                              newRules[index].closeTime = e.target.value;
                              setAvailabilityRules(newRules);
                            }}
                            className="w-full p-2 border border-input rounded-md"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newRules = availabilityRules.filter((_, i) => i !== index);
                            setAvailabilityRules(newRules);
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setAvailabilityRules([...availabilityRules, {
                          dayOfWeek: 1,
                          openTime: '09:00',
                          closeTime: '17:00',
                        }]);
                      }}
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add Availability Rule
                    </Button>
                  </div>
                </div>

                {/* Blackouts */}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Blackout Periods</h3>
                  <div className="space-y-4">
                    {blackouts.map((blackout, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Day of Week</label>
                            <select
                              value={blackout.dayOfWeek}
                              onChange={(e) => handleBlackoutDayChange(index, parseInt(e.target.value))}
                              className="w-full p-2 border border-input rounded-md"
                            >
                              <option value={0}>Sunday</option>
                              <option value={1}>Monday</option>
                              <option value={2}>Tuesday</option>
                              <option value={3}>Wednesday</option>
                              <option value={4}>Thursday</option>
                              <option value={5}>Friday</option>
                              <option value={6}>Saturday</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Start Time</label>
                            <input
                              type="time"
                              value={blackout.startTime}
                              onChange={(e) => handleBlackoutStartTimeChange(index, e.target.value)}
                              className="w-full p-2 border border-input rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">End Time</label>
                            <input
                              type="time"
                              value={blackout.endTime}
                              onChange={(e) => handleBlackoutEndTimeChange(index, e.target.value)}
                              className="w-full p-2 border border-input rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Reason</label>
                            <input
                              type="text"
                              value={blackout.reason}
                              onChange={(e) => handleBlackoutReasonChange(index, e.target.value)}
                              placeholder="e.g., Maintenance, Private Event"
                              className="w-full p-2 border border-input rounded-md"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBlackout(index)}
                        >
                          <i className="fas fa-trash mr-2"></i>
                          Remove Blackout
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setBlackouts([...blackouts, {
                          dayOfWeek: 0,
                          startTime: '09:00',
                          endTime: '17:00',
                          reason: '',
                        }]);
                      }}
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add Blackout Period
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Venue Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((imagePath, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                        <img
                          src={imagePath}
                          alt={`Venue image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Area */}
                {uploadedImages.length < 20 && (
                  <div
                    {...getRootProps()}
                    className={`
                      border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                      ${isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center space-y-2">
                      <i className="fas fa-camera text-3xl text-gray-400"></i>
                      <span className="text-lg font-medium text-gray-700">
                        {isDragActive
                          ? 'Drop images here'
                          : 'Upload Images'
                        }
                      </span>
                      <span className="text-sm text-gray-600">
                        ({uploadedImages.length}/20) - Click to browse or drag and drop
                      </span>
                      <p className="text-xs text-gray-500">
                        Supports JPG, PNG, WebP up to 5MB each
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Upload up to 20 high-quality images. Maximum 5MB per image.
                </p>
              </CardContent>
            </Card>

            <Separator />

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/host/dashboard')}
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createVenueMutation.isPending || updateVenueMutation.isPending}
                data-testid="submit-venue-button"
              >
                {createVenueMutation.isPending || updateVenueMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEdit ? 'Update Venue' : 'Submit for Review'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
