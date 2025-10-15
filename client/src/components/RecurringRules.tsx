import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Repeat,
  Plus,
  Trash2,
  Edit,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const recurringRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required"),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  isActive: z.boolean(),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.startTime < data.endTime;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
}).refine((data) => {
  if (data.breakStartTime && data.breakEndTime) {
    return data.breakStartTime < data.breakEndTime;
  }
  return true;
}, {
  message: "Break end time must be after break start time",
  path: ["breakEndTime"],
});

type RecurringRuleFormData = z.infer<typeof recurringRuleSchema>;

interface RecurringRule {
  id: string;
  name: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  isActive: boolean;
  createdAt: string;
}

interface RecurringRulesProps {
  venueId: string;
  rules: RecurringRule[];
  onAdd: (rule: Omit<RecurringRuleFormData, 'id'>) => void;
  onEdit: (id: string, rule: Omit<RecurringRuleFormData, 'id'>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
}

export default function RecurringRules({
  rules,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: RecurringRulesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringRule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  const form = useForm<RecurringRuleFormData>({
    resolver: zodResolver(recurringRuleSchema),
    defaultValues: {
      name: '',
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
      breakStartTime: '',
      breakEndTime: '',
    },
  });

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  const openAddDialog = () => {
    setEditingRule(null);
    form.reset({
      name: '',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
      breakStartTime: '',
      breakEndTime: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (rule: RecurringRule) => {
    setEditingRule(rule);
    form.reset({
      name: rule.name,
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
      isActive: rule.isActive,
      breakStartTime: rule.breakStartTime || '',
      breakEndTime: rule.breakEndTime || '',
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingRule(null);
    form.reset();
  };

  const handleSubmit = async (data: RecurringRuleFormData) => {
    setIsSubmitting(true);
    try {
      // Clean up break times if they're empty
      const cleanData = {
        ...data,
        breakStartTime: data.breakStartTime || undefined,
        breakEndTime: data.breakEndTime || undefined,
      };

      if (editingRule) {
        await onEdit(editingRule.id, cleanData);
      } else {
        await onAdd(cleanData);
      }
      closeDialog();
    } catch (error) {
      console.error('Error saving recurring rule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring rule?')) {
      await onDelete(id);
    }
  };

  const handleToggle = (id: string, isActive: boolean) => {
    onToggle(id, isActive);
  };

  const toggleRuleExpansion = (ruleId: string) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId);
    } else {
      newExpanded.add(ruleId);
    }
    setExpandedRules(newExpanded);
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const groupedRules = daysOfWeek.map(day => ({
    day,
    rules: rules.filter(rule => rule.dayOfWeek === day.value)
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Recurring Availability Rules
            </CardTitle>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Repeat className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium mb-1">No recurring rules</p>
              <p className="text-sm">Add recurring rules to automatically set availability for each day of the week</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedRules.map(({ day, rules: dayRules }) => (
                <div key={day.value}>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {day.label}
                    <Badge variant="outline" className="text-xs">
                      {dayRules.length} {dayRules.length === 1 ? 'rule' : 'rules'}
                    </Badge>
                  </h4>

                  {dayRules.length === 0 ? (
                    <div className="text-sm text-gray-500 ml-6 py-2">
                      No rules configured
                    </div>
                  ) : (
                    <div className="space-y-2 ml-6">
                      {dayRules.map((rule) => (
                        <Collapsible
                          key={rule.id}
                          open={expandedRules.has(rule.id)}
                          onOpenChange={() => toggleRuleExpansion(rule.id)}
                        >
                          <div className="border rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={rule.isActive}
                                  onCheckedChange={(isActive) => handleToggle(rule.id, isActive)}
                                />
                                <div>
                                  <h5 className="font-medium text-sm">{rule.name}</h5>
                                  <div className="text-xs text-gray-600 flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    {rule.startTime} - {rule.endTime}
                                    {rule.breakStartTime && rule.breakEndTime && (
                                      <span>(Break: {rule.breakStartTime} - {rule.breakEndTime})</span>
                                    )}
                                  </div>
                                </div>
                                {!rule.isActive && (
                                  <Badge variant="secondary" className="text-xs">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    {expandedRules.has(rule.id) ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(rule)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(rule.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <CollapsibleContent className="mt-3 pt-3 border-t">
                              <div className="text-sm space-y-2">
                                <div>
                                  <span className="font-medium">Operating Hours:</span> {rule.startTime} - {rule.endTime}
                                </div>
                                {rule.breakStartTime && rule.breakEndTime && (
                                  <div>
                                    <span className="font-medium">Break Period:</span> {rule.breakStartTime} - {rule.breakEndTime}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Status:</span> {rule.isActive ? 'Active' : 'Inactive'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Created: {new Date(rule.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              {editingRule ? 'Edit Recurring Rule' : 'Add Recurring Rule'}
            </DialogTitle>
            <DialogDescription>
              Set up automatic availability for specific days of the week.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rule Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Weekday Hours, Weekend Hours"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {daysOfWeek.map(day => (
                          <option key={day.value} value={day.value}>{day.label}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {timeOptions.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {timeOptions.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Break Period (Optional)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="breakStartTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Break Start</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">No break</option>
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="breakEndTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Break End</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">No break</option>
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Rule</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable this rule to automatically create availability
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
                  {isSubmitting ? 'Saving...' : editingRule ? 'Update' : 'Add'} Rule
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
