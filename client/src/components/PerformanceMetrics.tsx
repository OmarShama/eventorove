import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Star,
    Calendar,
    DollarSign,
    Clock,
    Target,
    Award,
    Eye,
    MessageSquare,
    ThumbsUp
} from 'lucide-react';

interface MetricData {
    label: string;
    value: number | string;
    change?: number;
    changeType?: 'increase' | 'decrease' | 'neutral';
    target?: number;
    icon: React.ReactNode;
    color: string;
    format?: 'currency' | 'percentage' | 'number' | 'rating';
    subtitle?: string;
}

interface PerformanceMetricsProps {
    timeRange?: 'week' | 'month' | 'quarter' | 'year';
    showComparisons?: boolean;
}

export default function PerformanceMetrics({
    showComparisons = true
}: PerformanceMetricsProps) {

    // Mock performance data
    const performanceData: MetricData[] = [
        {
            label: 'Total Revenue',
            value: 45200,
            change: 12.5,
            changeType: 'increase',
            target: 50000,
            icon: <DollarSign className="h-5 w-5" />,
            color: 'blue',
            format: 'currency',
            subtitle: 'vs last month'
        },
        {
            label: 'Booking Rate',
            value: 78.5,
            change: 5.2,
            changeType: 'increase',
            target: 80,
            icon: <Calendar className="h-5 w-5" />,
            color: 'green',
            format: 'percentage',
            subtitle: 'inquiry to booking'
        },
        {
            label: 'Average Rating',
            value: 4.7,
            change: 0.2,
            changeType: 'increase',
            target: 4.8,
            icon: <Star className="h-5 w-5" />,
            color: 'yellow',
            format: 'rating',
            subtitle: 'from 128 reviews'
        },
        {
            label: 'Response Time',
            value: '2.3h',
            change: -15,
            changeType: 'increase', // Decrease in time is good
            icon: <Clock className="h-5 w-5" />,
            color: 'purple',
            format: 'number',
            subtitle: 'avg response time'
        },
        {
            label: 'Repeat Customers',
            value: 34,
            change: 8.1,
            changeType: 'increase',
            target: 40,
            icon: <Users className="h-5 w-5" />,
            color: 'indigo',
            format: 'percentage',
            subtitle: 'customer retention'
        },
        {
            label: 'Profile Views',
            value: 1847,
            change: 23.7,
            changeType: 'increase',
            icon: <Eye className="h-5 w-5" />,
            color: 'gray',
            format: 'number',
            subtitle: 'this month'
        }
    ];

    const formatValue = (value: number | string, format?: string) => {
        if (typeof value === 'string') return value;

        switch (format) {
            case 'currency':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(value);
            case 'percentage':
                return `${value}%`;
            case 'rating':
                return value.toFixed(1);
            default:
                return value.toLocaleString();
        }
    };

    const getColorClasses = (color: string) => {
        const colorMap = {
            blue: {
                bg: 'bg-blue-50',
                text: 'text-blue-900',
                value: 'text-blue-600',
                icon: 'text-blue-600',
                progress: 'bg-blue-600'
            },
            green: {
                bg: 'bg-green-50',
                text: 'text-green-900',
                value: 'text-green-600',
                icon: 'text-green-600',
                progress: 'bg-green-600'
            },
            yellow: {
                bg: 'bg-yellow-50',
                text: 'text-yellow-900',
                value: 'text-yellow-600',
                icon: 'text-yellow-600',
                progress: 'bg-yellow-600'
            },
            purple: {
                bg: 'bg-purple-50',
                text: 'text-purple-900',
                value: 'text-purple-600',
                icon: 'text-purple-600',
                progress: 'bg-purple-600'
            },
            indigo: {
                bg: 'bg-indigo-50',
                text: 'text-indigo-900',
                value: 'text-indigo-600',
                icon: 'text-indigo-600',
                progress: 'bg-indigo-600'
            },
            gray: {
                bg: 'bg-gray-50',
                text: 'text-gray-900',
                value: 'text-gray-600',
                icon: 'text-gray-600',
                progress: 'bg-gray-600'
            }
        };
        return colorMap[color as keyof typeof colorMap] || colorMap.gray;
    };

    const renderChangeIndicator = (change?: number, changeType?: string) => {
        if (!change || !showComparisons) return null;

        const isPositive = changeType === 'increase';
        const Icon = isPositive ? TrendingUp : TrendingDown;
        const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

        return (
            <div className={`flex items-center space-x-1 ${colorClass}`}>
                <Icon className="h-3 w-3" />
                <span className="text-xs font-medium">
                    {Math.abs(change).toFixed(1)}%
                </span>
            </div>
        );
    };

    const calculateProgressPercentage = (value: number | string, target?: number) => {
        if (!target || typeof value === 'string') return 0;
        return Math.min((value / target) * 100, 100);
    };

    return (
        <div className="space-y-6">
            {/* Key Performance Indicators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>Key Performance Indicators</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {performanceData.map((metric, index) => {
                            const colors = getColorClasses(metric.color);
                            const progressPercentage = calculateProgressPercentage(metric.value, metric.target);

                            return (
                                <div key={index} className={`p-4 rounded-lg ${colors.bg}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={colors.icon}>
                                            {metric.icon}
                                        </div>
                                        {renderChangeIndicator(metric.change, metric.changeType)}
                                    </div>

                                    <div className="space-y-1">
                                        <p className={`text-sm font-medium ${colors.text}`}>
                                            {metric.label}
                                        </p>
                                        <p className={`text-2xl font-bold ${colors.value}`}>
                                            {formatValue(metric.value, metric.format)}
                                        </p>
                                        {metric.subtitle && (
                                            <p className={`text-xs ${colors.text} opacity-70`}>
                                                {metric.subtitle}
                                            </p>
                                        )}
                                    </div>

                                    {/* Progress bar for metrics with targets */}
                                    {metric.target && typeof metric.value === 'number' && (
                                        <div className="mt-3 space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className={colors.text}>Progress to target</span>
                                                <span className={colors.text}>
                                                    {formatValue(metric.target, metric.format)}
                                                </span>
                                            </div>
                                            <Progress
                                                value={progressPercentage}
                                                className="h-2"
                                            />
                                            <p className={`text-xs ${colors.text} opacity-70`}>
                                                {progressPercentage.toFixed(1)}% of target achieved
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performing Areas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Award className="h-5 w-5" />
                            <span>Top Performing Areas</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <ThumbsUp className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-900">Customer Satisfaction</p>
                                    <p className="text-sm text-green-700">4.7/5 average rating</p>
                                </div>
                            </div>
                            <Badge className="bg-green-600">Excellent</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="font-medium text-blue-900">Booking Conversion</p>
                                    <p className="text-sm text-blue-700">78.5% inquiry to booking</p>
                                </div>
                            </div>
                            <Badge className="bg-blue-600">Strong</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Clock className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="font-medium text-purple-900">Response Speed</p>
                                    <p className="text-sm text-purple-700">2.3h average response time</p>
                                </div>
                            </div>
                            <Badge className="bg-purple-600">Good</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Areas for Improvement */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Target className="h-5 w-5" />
                            <span>Growth Opportunities</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <Users className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-yellow-900">Repeat Customer Rate</p>
                                    <p className="text-sm text-yellow-800 mb-2">
                                        Currently at 34%, target is 40%
                                    </p>
                                    <p className="text-xs text-yellow-700">
                                        💡 Consider implementing a loyalty program or follow-up campaigns
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <Eye className="h-5 w-5 text-orange-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-orange-900">Profile Visibility</p>
                                    <p className="text-sm text-orange-800 mb-2">
                                        1,847 views this month, trending up 23.7%
                                    </p>
                                    <p className="text-xs text-orange-700">
                                        💡 Optimize profile with better photos and detailed descriptions
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <MessageSquare className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-red-900">Review Count</p>
                                    <p className="text-sm text-red-800 mb-2">
                                        128 reviews total, could use more recent feedback
                                    </p>
                                    <p className="text-xs text-red-700">
                                        💡 Follow up with recent guests to encourage reviews
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">A-</div>
                            <p className="text-sm text-gray-600">Overall Grade</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">85%</div>
                            <p className="text-sm text-gray-600">Goals Met</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">↗ 12%</div>
                            <p className="text-sm text-gray-600">Growth Rate</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">Top 15%</div>
                            <p className="text-sm text-gray-600">Market Ranking</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
