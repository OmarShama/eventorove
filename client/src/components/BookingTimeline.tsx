import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle,
    Clock,
    Calendar,
    CreditCard
} from 'lucide-react';
import { BookingStatus } from '@/components/BookingStatusBadge';

interface TimelineEvent {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    type: 'success' | 'info' | 'warning' | 'error';
    icon?: React.ReactNode;
    details?: string[];
}

interface BookingTimelineProps {
    bookingId: string;
    status: BookingStatus;
    events?: TimelineEvent[];
    createdAt: string;
    updatedAt: string;
}

export default function BookingTimeline({
    bookingId,
    status,
    events = [],
    createdAt,
    updatedAt
}: BookingTimelineProps) {
    // Generate default timeline events based on booking status
    const generateDefaultEvents = (): TimelineEvent[] => {
        const defaultEvents: TimelineEvent[] = [
            {
                id: 'created',
                title: 'Booking Created',
                description: 'Your booking request has been submitted',
                timestamp: createdAt,
                type: 'info',
                icon: <Calendar className="h-4 w-4" />,
                details: [`Booking ID: ${bookingId}`, 'Confirmation email sent']
            }
        ];

        switch (status) {
            case 'confirmed':
                defaultEvents.push(
                    {
                        id: 'payment',
                        title: 'Payment Processed',
                        description: 'Payment has been successfully processed',
                        timestamp: updatedAt,
                        type: 'success',
                        icon: <CreditCard className="h-4 w-4" />,
                        details: ['Payment method: Credit Card', 'Transaction completed']
                    },
                    {
                        id: 'confirmed',
                        title: 'Booking Confirmed',
                        description: 'Your booking has been confirmed by the venue',
                        timestamp: updatedAt,
                        type: 'success',
                        icon: <CheckCircle className="h-4 w-4" />,
                        details: ['Venue contact information sent', 'Booking details finalized']
                    }
                );
                break;

            case 'pending':
                defaultEvents.push({
                    id: 'pending',
                    title: 'Awaiting Confirmation',
                    description: 'Waiting for venue confirmation and payment processing',
                    timestamp: updatedAt,
                    type: 'warning',
                    icon: <Clock className="h-4 w-4" />,
                    details: ['Payment authorization pending', 'Venue review in progress']
                });
                break;

            case 'cancelled':
                defaultEvents.push({
                    id: 'cancelled',
                    title: 'Booking Cancelled',
                    description: 'This booking has been cancelled',
                    timestamp: updatedAt,
                    type: 'error',
                    icon: <CheckCircle className="h-4 w-4" />,
                    details: ['Refund processed', 'Cancellation confirmation sent']
                });
                break;

            case 'completed':
                defaultEvents.push(
                    {
                        id: 'confirmed',
                        title: 'Booking Confirmed',
                        description: 'Your booking was confirmed',
                        timestamp: createdAt,
                        type: 'success',
                        icon: <CheckCircle className="h-4 w-4" />
                    },
                    {
                        id: 'completed',
                        title: 'Event Completed',
                        description: 'Your event has been successfully completed',
                        timestamp: updatedAt,
                        type: 'success',
                        icon: <CheckCircle className="h-4 w-4" />,
                        details: ['Event concluded', 'Feedback request sent']
                    }
                );
                break;
        }

        return defaultEvents;
    };

    const timelineEvents = events.length > 0 ? events : generateDefaultEvents();

    const getEventTypeStyles = (type: TimelineEvent['type']) => {
        switch (type) {
            case 'success':
                return {
                    dot: 'bg-green-500 border-green-200',
                    line: 'border-green-200',
                    icon: 'text-green-600',
                    badge: 'bg-green-100 text-green-800'
                };
            case 'warning':
                return {
                    dot: 'bg-yellow-500 border-yellow-200',
                    line: 'border-yellow-200',
                    icon: 'text-yellow-600',
                    badge: 'bg-yellow-100 text-yellow-800'
                };
            case 'error':
                return {
                    dot: 'bg-red-500 border-red-200',
                    line: 'border-red-200',
                    icon: 'text-red-600',
                    badge: 'bg-red-100 text-red-800'
                };
            default:
                return {
                    dot: 'bg-blue-500 border-blue-200',
                    line: 'border-blue-200',
                    icon: 'text-blue-600',
                    badge: 'bg-blue-100 text-blue-800'
                };
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            }),
        };
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Booking Timeline</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {timelineEvents.map((event, index) => {
                        const styles = getEventTypeStyles(event.type);
                        const { date, time } = formatTimestamp(event.timestamp);
                        const isLast = index === timelineEvents.length - 1;

                        return (
                            <div key={event.id} className="relative flex items-start space-x-4 pb-8">
                                {/* Timeline line */}
                                {!isLast && (
                                    <div
                                        className={`absolute left-4 top-8 w-0.5 h-full border-l-2 ${styles.line}`}
                                        style={{ marginLeft: '1px' }}
                                    />
                                )}

                                {/* Timeline dot */}
                                <div className={`relative flex-shrink-0 w-8 h-8 rounded-full border-2 ${styles.dot} flex items-center justify-center`}>
                                    {event.icon ? (
                                        <div className={styles.icon}>
                                            {event.icon}
                                        </div>
                                    ) : (
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    )}
                                </div>

                                {/* Event content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900">
                                                {event.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {event.description}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className={`${styles.badge} ml-4 whitespace-nowrap`}>
                                            <span className="capitalize">{event.type}</span>
                                        </Badge>
                                    </div>

                                    {/* Event details */}
                                    {event.details && event.details.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {event.details.map((detail, idx) => (
                                                <p key={idx} className="text-xs text-gray-500 flex items-center">
                                                    <span className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                                                    {detail}
                                                </p>
                                            ))}
                                        </div>
                                    )}

                                    {/* Timestamp */}
                                    <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                                        <span className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {date}
                                        </span>
                                        <span className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Status summary */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Current Status:</span>
                        <Badge variant="outline" className="capitalize">
                            {status.replace('_', ' ')}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="text-gray-900">
                            {formatTimestamp(updatedAt).date} at {formatTimestamp(updatedAt).time}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
