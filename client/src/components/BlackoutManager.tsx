import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  CalendarX, 
  Plus, 
  Trash2, 
  Edit, 
  AlertTriangle,
  Calendar
} from 'lucide-react';

const blackoutSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(1, "Reason is required"),
  title: z.string().min(1, "Title is required"),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

type BlackoutFormData = z.infer<typeof blackoutSchema>;

interface Blackout {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  reason: string;
  createdAt: string;
}

interface BlackoutManagerProps {
  venueId: string;
  blackouts: Blackout[];
  onAdd: (blackout: Omit<BlackoutFormData, 'id'>) => void;
  onEdit: (id: string, blackout: Omit<BlackoutFormData, 'id'>) => void;
  onDelete: (id: string) => void;
}

export default function BlackoutManager({
  venueId,
  blackouts,
  onAdd,
  onEdit,
  onDelete,
}: BlackoutManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // TODO: Use venueId for API calls to fetch/update blackouts  
  console.debug('Managing blackouts for venue:', venueId);
  const [editingBlackout, setEditingBlackout] = useState<Blackout | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BlackoutFormData>({
    resolver: zodResolver(blackoutSchema),
    defaultValues: {
      title: '',
      startDate: '',
      endDate: '',
      reason: '',
    },
  });

  const openAddDialog = () => {
    setEditingBlackout(null);
    form.reset({
      title: '',
      startDate: '',
      endDate: '',
      reason: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (blackout: Blackout) => {
    setEditingBlackout(blackout);
    form.reset({
      title: blackout.title,
      startDate: blackout.startDate,
      endDate: blackout.endDate,
      reason: blackout.reason,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingBlackout(null);
    form.reset();
  };

  const handleSubmit = async (data: BlackoutFormData) => {
    setIsSubmitting(true);
    try {
      if (editingBlackout) {
        await onEdit(editingBlackout.id, data);
      } else {
        await onAdd(data);
      }
      closeDialog();
    } catch (error) {
      console.error('Error saving blackout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blackout period?')) {
      await onDelete(id);
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (startDate === endDate) {
      return start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    
    return `${start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })}`;
  };

  const getBlackoutStatus = (blackout: Blackout) => {
    const now = new Date();
    const start = new Date(blackout.startDate);
    const end = new Date(blackout.endDate + 'T23:59:59');
    
    if (now < start) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= start && now <= end) {
      return { status: 'active', color: 'bg-red-100 text-red-800' };
    } else {
      return { status: 'past', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarX className="h-5 w-5" />
              Blackout Periods
            </CardTitle>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Blackout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {blackouts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarX className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium mb-1">No blackout periods</p>
              <p className="text-sm">Add blackout periods to block bookings during specific dates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blackouts.map((blackout) => {
                const statusInfo = getBlackoutStatus(blackout);
                return (
                  <div
                    key={blackout.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{blackout.title}</h4>
                        <Badge className={statusInfo.color}>
                          {statusInfo.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDateRange(blackout.startDate, blackout.endDate)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{blackout.reason}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(blackout)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(blackout.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarX className="h-5 w-5" />
              {editingBlackout ? 'Edit Blackout Period' : 'Add Blackout Period'}
            </DialogTitle>
            <DialogDescription>
              Block bookings during specific dates or date ranges.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Maintenance, Holiday, Private Event"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={today}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={form.watch('startDate') || today}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain why this period is blocked"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important:</p>
                  <p>Existing bookings during this period will not be automatically cancelled. Please review and handle them separately.</p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingBlackout ? 'Update' : 'Add'} Blackout
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
