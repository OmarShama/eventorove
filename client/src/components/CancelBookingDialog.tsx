import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
    AlertTriangle,
    Calendar,
    DollarSign,
    Clock,
    Info,
    CheckCircle2
} from 'lucide-react';

interface CancelBookingDialogProps {
    bookingId: string;
    bookingNumber: string;
    startTime: string;
    totalCost: number;
    children: React.ReactNode;
    onCancel?: () => void;
}

interface CancellationFormData {
    reason: string;
    acknowledged: boolean;
}

const CANCELLATION_REASONS = [
    'Schedule conflict',
    'Budget constraints',
    'Change of plans',
    'Found alternative venue',
    'Event postponed',
    'Emergency situation',
    'Other'
];

export default function CancelBookingDialog({
    bookingId,
    bookingNumber,
    startTime,
    totalCost,
    children,
    onCancel,
}: CancelBookingDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm<CancellationFormData>();

    const acknowledgedValue = watch('acknowledged');

    const cancelBookingMutation = useMutation({
        mutationFn: async () => {
            // TODO: Implement actual API call
            // return bookingApi.cancelBooking(bookingId, { reason: selectedReason, customReason: customReason });

            // Mock API call for development
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { success: true, message: 'Booking cancelled successfully' };
        },
        onSuccess: () => {
            toast({
                title: 'Booking Cancelled',
                description: 'Your booking has been successfully cancelled.',
            });
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
            setIsOpen(false);
            setShowConfirmation(false);
            reset();
            onCancel?.();
        },
        onError: (error: any) => {
            toast({
                title: 'Cancellation Failed',
                description: error.message || 'Failed to cancel booking. Please try again.',
                variant: 'destructive',
            });
        },
    });

    const calculateRefundAmount = () => {
        const eventDate = new Date(startTime);
        const now = new Date();
        const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Refund policy logic
        if (hoursUntilEvent > 72) {
            return { amount: totalCost * 0.9, percentage: 90 }; // 90% refund
        } else if (hoursUntilEvent > 24) {
            return { amount: totalCost * 0.5, percentage: 50 }; // 50% refund
        } else if (hoursUntilEvent > 2) {
            return { amount: totalCost * 0.25, percentage: 25 }; // 25% refund
        } else {
            return { amount: 0, percentage: 0 }; // No refund
        }
    };

    const refundInfo = calculateRefundAmount();

    const onSubmit = () => {
        setShowConfirmation(true);
    };

    const handleConfirmCancellation = () => {
        cancelBookingMutation.mutate();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            reset();
            setSelectedReason('');
            setShowConfirmation(false);
        }
        setIsOpen(open);
    };

    const eventDate = new Date(startTime);
    const hoursUntilEvent = Math.max(0, (eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60));

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <span>Cancel Booking</span>
                        </DialogTitle>
                        <DialogDescription>
                            Cancel your booking for <strong>#{bookingNumber}</strong>. Please review the cancellation details below.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Booking Summary */}
                        <Card className="bg-gray-50">
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Event Date</p>
                                            <p className="text-muted-foreground">
                                                {eventDate.toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Time Until Event</p>
                                            <p className="text-muted-foreground">
                                                {hoursUntilEvent < 1 ? 'Less than 1 hour' :
                                                    hoursUntilEvent < 24 ? `${Math.ceil(hoursUntilEvent)} hours` :
                                                        `${Math.ceil(hoursUntilEvent / 24)} days`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Refund Information */}
                        <Card className={`border-2 ${refundInfo.percentage > 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                            <CardContent className="pt-4">
                                <div className="flex items-start space-x-3">
                                    <DollarSign className={`h-5 w-5 mt-0.5 ${refundInfo.percentage > 0 ? 'text-green-600' : 'text-red-600'}`} />
                                    <div className="flex-1">
                                        <h4 className={`font-semibold ${refundInfo.percentage > 0 ? 'text-green-900' : 'text-red-900'}`}>
                                            Refund Information
                                        </h4>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Original Amount:</span>
                                                <span className="font-medium">${totalCost}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Refund Amount ({refundInfo.percentage}%):</span>
                                                <span className="font-bold text-lg">
                                                    ${refundInfo.amount.toFixed(2)}
                                                </span>
                                            </div>
                                            {refundInfo.percentage < 100 && (
                                                <div className="flex justify-between text-sm">
                                                    <span>Cancellation Fee:</span>
                                                    <span className="text-red-600">
                                                        -${(totalCost - refundInfo.amount).toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={`mt-2 text-xs ${refundInfo.percentage > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                            {refundInfo.percentage > 0
                                                ? 'Refund will be processed within 3-5 business days to your original payment method.'
                                                : 'No refund available due to cancellation policy.'
                                            }
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cancellation Reason */}
                        <div className="space-y-3">
                            <Label htmlFor="reason">Reason for Cancellation *</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {CANCELLATION_REASONS.map((reason) => (
                                    <Button
                                        key={reason}
                                        type="button"
                                        variant={selectedReason === reason ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedReason(reason)}
                                        className="justify-start h-auto py-2 px-3"
                                    >
                                        {reason}
                                    </Button>
                                ))}
                            </div>
                            {!selectedReason && (
                                <p className="text-sm text-red-600">Please select a reason for cancellation</p>
                            )}
                        </div>

                        {/* Custom Reason */}
                        {selectedReason === 'Other' && (
                            <div className="space-y-2">
                                <Label htmlFor="customReason">Please specify</Label>
                                <Textarea
                                    id="customReason"
                                    {...register('reason', {
                                        required: selectedReason === 'Other' ? 'Please provide a reason' : false,
                                    })}
                                    placeholder="Please provide more details about your cancellation reason..."
                                    rows={3}
                                />
                                {errors.reason && (
                                    <p className="text-sm text-red-600">{errors.reason.message}</p>
                                )}
                            </div>
                        )}

                        {/* Acknowledgment */}
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="acknowledged"
                                    {...register('acknowledged', {
                                        required: 'You must acknowledge the cancellation policy',
                                    })}
                                />
                                <Label htmlFor="acknowledged" className="text-sm leading-5">
                                    I understand and agree to the cancellation policy. I acknowledge that this action cannot be undone and any refund will be processed according to the terms shown above.
                                </Label>
                            </div>
                            {errors.acknowledged && (
                                <p className="text-sm text-red-600">{errors.acknowledged.message}</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                            >
                                Keep Booking
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={!selectedReason || !acknowledgedValue}
                            >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Cancel Booking
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <span>Confirm Cancellation</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                            <p>
                                Are you absolutely sure you want to cancel booking <strong>#{bookingNumber}</strong>?
                            </p>
                            <div className="bg-yellow-50 p-3 rounded-md">
                                <div className="flex items-start space-x-2">
                                    <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium text-yellow-900">This action cannot be undone:</p>
                                        <ul className="mt-1 list-disc list-inside text-yellow-700 space-y-1">
                                            <li>Your booking will be permanently cancelled</li>
                                            <li>You will receive ${refundInfo.amount.toFixed(2)} as refund</li>
                                            <li>The venue will be notified immediately</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>No, Keep Booking</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmCancellation}
                            disabled={cancelBookingMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {cancelBookingMutation.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Cancelling...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Yes, Cancel Booking
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
