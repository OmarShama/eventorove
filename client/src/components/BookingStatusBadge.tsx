import { Badge } from '@/components/ui/badge';
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Calendar,
    DollarSign,
    RefreshCw
} from 'lucide-react';

export type BookingStatus =
    | 'pending'
    | 'confirmed'
    | 'cancelled'
    | 'completed'
    | 'in_progress'
    | 'payment_pending'
    | 'refunded';

interface BookingStatusBadgeProps {
    status: BookingStatus;
    size?: 'sm' | 'default' | 'lg';
    showIcon?: boolean;
}

export default function BookingStatusBadge({
    status,
    size = 'default',
    showIcon = true
}: BookingStatusBadgeProps) {
    const getStatusConfig = (status: BookingStatus) => {
        switch (status) {
            case 'pending':
                return {
                    variant: 'secondary' as const,
                    label: 'Pending',
                    icon: <Clock className="h-3 w-3" />,
                    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                };
            case 'confirmed':
                return {
                    variant: 'default' as const,
                    label: 'Confirmed',
                    icon: <CheckCircle className="h-3 w-3" />,
                    className: 'bg-green-100 text-green-800 border-green-200',
                };
            case 'cancelled':
                return {
                    variant: 'destructive' as const,
                    label: 'Cancelled',
                    icon: <XCircle className="h-3 w-3" />,
                    className: 'bg-red-100 text-red-800 border-red-200',
                };
            case 'completed':
                return {
                    variant: 'default' as const,
                    label: 'Completed',
                    icon: <CheckCircle className="h-3 w-3" />,
                    className: 'bg-blue-100 text-blue-800 border-blue-200',
                };
            case 'in_progress':
                return {
                    variant: 'default' as const,
                    label: 'In Progress',
                    icon: <Calendar className="h-3 w-3" />,
                    className: 'bg-purple-100 text-purple-800 border-purple-200',
                };
            case 'payment_pending':
                return {
                    variant: 'secondary' as const,
                    label: 'Payment Pending',
                    icon: <DollarSign className="h-3 w-3" />,
                    className: 'bg-orange-100 text-orange-800 border-orange-200',
                };
            case 'refunded':
                return {
                    variant: 'outline' as const,
                    label: 'Refunded',
                    icon: <RefreshCw className="h-3 w-3" />,
                    className: 'bg-gray-100 text-gray-800 border-gray-200',
                };
            default:
                return {
                    variant: 'secondary' as const,
                    label: 'Unknown',
                    icon: <AlertCircle className="h-3 w-3" />,
                    className: 'bg-gray-100 text-gray-800 border-gray-200',
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <Badge
            variant={config.variant}
            className={`${config.className} ${size === 'sm' ? 'text-xs px-2 py-0.5' :
                    size === 'lg' ? 'text-sm px-3 py-1' :
                        'text-xs px-2.5 py-0.5'
                } ${showIcon ? 'flex items-center gap-1' : ''}`}
        >
            {showIcon && config.icon}
            <span>{config.label}</span>
        </Badge>
    );
}
