import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, MessageSquare, Calendar } from 'lucide-react';

interface NotificationPreferences {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    bookingReminders: boolean;
    marketingEmails: boolean;
    securityAlerts: boolean;
    venueUpdates: boolean;
    paymentNotifications: boolean;
}

export default function NotificationSettings() {
    const { toast } = useToast();
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        bookingReminders: true,
        marketingEmails: false,
        securityAlerts: true,
        venueUpdates: true,
        paymentNotifications: true,
    });

    const [isLoading, setIsLoading] = useState(false);

    const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // TODO: Implement API call to save notification preferences
            // await authApi.updateNotificationSettings(preferences);
            toast({
                title: 'Success',
                description: 'Notification preferences updated successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update notification preferences',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const notificationGroups = [
        {
            title: 'Communication Channels',
            icon: <Mail className="h-5 w-5" />,
            settings: [
                {
                    key: 'emailNotifications' as keyof NotificationPreferences,
                    label: 'Email Notifications',
                    description: 'Receive notifications via email',
                },
                {
                    key: 'pushNotifications' as keyof NotificationPreferences,
                    label: 'Push Notifications',
                    description: 'Receive browser push notifications',
                },
                {
                    key: 'smsNotifications' as keyof NotificationPreferences,
                    label: 'SMS Notifications',
                    description: 'Receive notifications via text message',
                },
            ],
        },
        {
            title: 'Booking & Events',
            icon: <Calendar className="h-5 w-5" />,
            settings: [
                {
                    key: 'bookingReminders' as keyof NotificationPreferences,
                    label: 'Booking Reminders',
                    description: 'Get reminded about upcoming bookings',
                },
                {
                    key: 'venueUpdates' as keyof NotificationPreferences,
                    label: 'Venue Updates',
                    description: 'Notifications about venue changes and announcements',
                },
            ],
        },
        {
            title: 'Account & Security',
            icon: <Bell className="h-5 w-5" />,
            settings: [
                {
                    key: 'securityAlerts' as keyof NotificationPreferences,
                    label: 'Security Alerts',
                    description: 'Important security notifications (always enabled)',
                    disabled: true,
                },
                {
                    key: 'paymentNotifications' as keyof NotificationPreferences,
                    label: 'Payment Notifications',
                    description: 'Notifications about payments and billing',
                },
            ],
        },
        {
            title: 'Marketing',
            icon: <MessageSquare className="h-5 w-5" />,
            settings: [
                {
                    key: 'marketingEmails' as keyof NotificationPreferences,
                    label: 'Marketing Emails',
                    description: 'Promotional emails and special offers',
                },
            ],
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notification Preferences</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {notificationGroups.map((group) => (
                    <div key={group.title} className="space-y-4">
                        <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                            {group.icon}
                            <h3>{group.title}</h3>
                        </div>
                        <div className="space-y-3 pl-7">
                            {group.settings.map((setting) => (
                                <div key={setting.key} className="flex items-center justify-between space-x-4">
                                    <div className="flex-1">
                                        <Label
                                            htmlFor={setting.key}
                                            className="text-sm font-medium cursor-pointer"
                                        >
                                            {setting.label}
                                        </Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {setting.description}
                                        </p>
                                    </div>
                                    <Switch
                                        id={setting.key}
                                        checked={preferences[setting.key]}
                                        onCheckedChange={(checked) =>
                                            handlePreferenceChange(setting.key, checked)
                                        }
                                        disabled={setting.disabled}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="pt-4 border-t">
                    <div className="flex justify-end space-x-2">
                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Preferences'}
                        </Button>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="text-sm text-blue-800">
                        <strong>Note:</strong> Some notifications like security alerts and booking confirmations
                        are essential for account security and service functionality, so they cannot be disabled.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
