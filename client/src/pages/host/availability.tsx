import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, Settings } from 'lucide-react';

// Import our components
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import TimeSlotEditor from '@/components/TimeSlotEditor';
import BlackoutManager from '@/components/BlackoutManager';
import RecurringRules from '@/components/RecurringRules';

// Mock data - replace with actual API calls
const mockAvailability = [
  {
    date: '2024-01-15',
    timeSlots: [
      { id: '1', startTime: '09:00', endTime: '12:00', isBlocked: false },
      { id: '2', startTime: '14:00', endTime: '17:00', isBlocked: false },
    ],
    isBlackout: false,
  },
  {
    date: '2024-01-16',
    timeSlots: [
      { id: '3', startTime: '10:00', endTime: '15:00', isBlocked: true, reason: 'Maintenance' },
    ],
    isBlackout: false,
  },
];

const mockBlackouts = [
  {
    id: '1',
    title: 'Holiday Break',
    startDate: '2024-12-23',
    endDate: '2024-01-02',
    reason: 'Closed for holidays',
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: '2',
    title: 'Maintenance Week',
    startDate: '2024-02-15',
    endDate: '2024-02-22',
    reason: 'Scheduled maintenance and renovations',
    createdAt: '2024-01-10T00:00:00Z',
  },
];

const mockRecurringRules = [
  {
    id: '1',
    name: 'Weekday Business Hours',
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '17:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00',
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: '2',
    name: 'Weekend Hours',
    dayOfWeek: 6, // Saturday
    startTime: '10:00',
    endTime: '16:00',
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
  },
];

export default function VenueAvailability() {
  const router = useRouter();
  const { venueId } = router.query;
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [timeSlotDialogOpen, setTimeSlotDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const { data: availability = mockAvailability } = useQuery({
    queryKey: ['venue-availability', venueId],
    queryFn: () => Promise.resolve(mockAvailability),
    enabled: !!venueId,
  });

  const { data: blackouts = mockBlackouts } = useQuery({
    queryKey: ['venue-blackouts', venueId],
    queryFn: () => Promise.resolve(mockBlackouts),
    enabled: !!venueId,
  });

  const { data: recurringRules = mockRecurringRules } = useQuery({
    queryKey: ['venue-recurring-rules', venueId],
    queryFn: () => Promise.resolve(mockRecurringRules),
    enabled: !!venueId,
  });

  // Mutations for managing availability
  const addTimeSlotMutation = useMutation({
    mutationFn: async (data: { date: string; timeSlot: any }) => {
      // Mock implementation
      console.log('Adding time slot:', data);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-availability', venueId] });
      toast({
        title: "Time Slot Added",
        description: "The time slot has been added successfully.",
      });
    },
  });

  const removeTimeSlotMutation = useMutation({
    mutationFn: async (data: { date: string; slotId: string }) => {
      // Mock implementation
      console.log('Removing time slot:', data);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-availability', venueId] });
      toast({
        title: "Time Slot Removed",
        description: "The time slot has been removed successfully.",
      });
    },
  });

  const toggleBlackoutMutation = useMutation({
    mutationFn: async (data: { date: string }) => {
      // Mock implementation
      console.log('Toggling blackout:', data);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-availability', venueId] });
      toast({
        title: "Blackout Updated",
        description: "The blackout status has been updated.",
      });
    },
  });

  const addBlackoutMutation = useMutation({
    mutationFn: async (blackout: any) => {
      // Mock implementation
      console.log('Adding blackout:', blackout);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-blackouts', venueId] });
      toast({
        title: "Blackout Added",
        description: "The blackout period has been added successfully.",
      });
    },
  });

  const editBlackoutMutation = useMutation({
    mutationFn: async (data: { id: string; blackout: any }) => {
      // Mock implementation
      console.log('Editing blackout:', data);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-blackouts', venueId] });
      toast({
        title: "Blackout Updated",
        description: "The blackout period has been updated successfully.",
      });
    },
  });

  const deleteBlackoutMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation
      console.log('Deleting blackout:', id);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-blackouts', venueId] });
      toast({
        title: "Blackout Deleted",
        description: "The blackout period has been deleted successfully.",
      });
    },
  });

  const addRecurringRuleMutation = useMutation({
    mutationFn: async (rule: any) => {
      // Mock implementation
      console.log('Adding recurring rule:', rule);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-recurring-rules', venueId] });
      toast({
        title: "Rule Added",
        description: "The recurring rule has been added successfully.",
      });
    },
  });

  const editRecurringRuleMutation = useMutation({
    mutationFn: async (data: { id: string; rule: any }) => {
      // Mock implementation
      console.log('Editing recurring rule:', data);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-recurring-rules', venueId] });
      toast({
        title: "Rule Updated",
        description: "The recurring rule has been updated successfully.",
      });
    },
  });

  const deleteRecurringRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation
      console.log('Deleting recurring rule:', id);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-recurring-rules', venueId] });
      toast({
        title: "Rule Deleted",
        description: "The recurring rule has been deleted successfully.",
      });
    },
  });

  const toggleRecurringRuleMutation = useMutation({
    mutationFn: async (data: { id: string; isActive: boolean }) => {
      // Mock implementation
      console.log('Toggling recurring rule:', data);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-recurring-rules', venueId] });
      toast({
        title: "Rule Updated",
        description: "The recurring rule status has been updated.",
      });
    },
  });

  // Handler functions
  const handleAddTimeSlot = (date: string) => {
    setSelectedDate(date);
    setTimeSlotDialogOpen(true);
  };

  const handleSaveTimeSlot = (timeSlot: any) => {
    if (selectedDate) {
      addTimeSlotMutation.mutate({ date: selectedDate, timeSlot });
    }
  };

  const handleRemoveTimeSlot = (date: string, slotId: string) => {
    removeTimeSlotMutation.mutate({ date, slotId });
  };

  const handleToggleBlackout = (date: string) => {
    toggleBlackoutMutation.mutate({ date });
  };

  const handleAddBlackout = (blackout: any) => {
    addBlackoutMutation.mutate(blackout);
  };

  const handleEditBlackout = (id: string, blackout: any) => {
    editBlackoutMutation.mutate({ id, blackout });
  };

  const handleDeleteBlackout = (id: string) => {
    deleteBlackoutMutation.mutate(id);
  };

  const handleAddRecurringRule = (rule: any) => {
    addRecurringRuleMutation.mutate(rule);
  };

  const handleEditRecurringRule = (id: string, rule: any) => {
    editRecurringRuleMutation.mutate({ id, rule });
  };

  const handleDeleteRecurringRule = (id: string) => {
    deleteRecurringRuleMutation.mutate(id);
  };

  const handleToggleRecurringRule = (id: string, isActive: boolean) => {
    toggleRecurringRuleMutation.mutate({ id, isActive });
  };

  if (authLoading || venueLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading availability settings...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Venue Availability</h1>
              <p className="text-gray-600 mt-2">
                Manage when your venue is available for bookings
              </p>
              {venue && (
                <p className="text-sm text-gray-500 mt-1">
                  Venue: {venue.title}
                </p>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="recurring" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recurring Rules
            </TabsTrigger>
            <TabsTrigger value="blackouts" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Blackouts
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <AvailabilityCalendar
              venueId={venueId as string}
              availability={availability}
              onAddTimeSlot={handleAddTimeSlot}
              onRemoveTimeSlot={handleRemoveTimeSlot}
              onToggleBlackout={handleToggleBlackout}
            />
          </TabsContent>

          <TabsContent value="recurring" className="space-y-4">
            <RecurringRules
              venueId={venueId as string}
              rules={recurringRules}
              onAdd={handleAddRecurringRule}
              onEdit={handleEditRecurringRule}
              onDelete={handleDeleteRecurringRule}
              onToggle={handleToggleRecurringRule}
            />
          </TabsContent>

          <TabsContent value="blackouts" className="space-y-4">
            <BlackoutManager
              venueId={venueId as string}
              blackouts={blackouts}
              onAdd={handleAddBlackout}
              onEdit={handleEditBlackout}
              onDelete={handleDeleteBlackout}
            />
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recurring Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {recurringRules.filter(r => r.isActive).length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Active rules out of {recurringRules.length} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Blackout Periods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {blackouts.length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Scheduled blackout periods
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Custom Time Slots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {availability.reduce((total, day) => total + day.timeSlots.length, 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Custom time slots configured
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/venue-manage/${venueId}`)}
                    className="justify-start"
                  >
                    View Venue Details
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/host/calendar')}
                    className="justify-start"
                  >
                    View Booking Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Time Slot Editor Dialog */}
        <TimeSlotEditor
          isOpen={timeSlotDialogOpen}
          onClose={() => setTimeSlotDialogOpen(false)}
          onSave={handleSaveTimeSlot}
          date={selectedDate || ''}
        />
      </div>
    </div>
  );
}
