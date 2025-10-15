import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
// Layout is now handled globally in _app.tsx
import SettingsForm from '@/components/SettingsForm';
import PasswordChangeForm from '@/components/PasswordChangeForm';
import NotificationSettings from '@/components/NotificationSettings';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowLeft,
    Settings as SettingsIcon,
    Lock,
    Bell,
    Trash2,
    Download,
    AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('general');

    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
        router.push('/login');
        return null;
    }

    // Show loading state
    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-lg text-muted-foreground">Loading settings...</p>
                </div>
            </div>
        );
    }

    const handleExportData = () => {
        // TODO: Implement data export functionality
        toast({
            title: 'Data Export',
            description: 'Your data export request has been queued. You will receive an email when ready.',
        });
    };

    const handleDeleteAccount = () => {
        // TODO: Implement account deletion with confirmation dialog
        toast({
            title: 'Account Deletion',
            description: 'Please contact support to delete your account.',
            variant: 'destructive',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                            <p className="mt-2 text-gray-600">
                                Manage your account preferences and security settings
                            </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                            {user.role} Account
                        </Badge>
                    </div>
                </div>

                {/* Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                        <TabsTrigger value="general" className="flex items-center space-x-2">
                            <SettingsIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">General</span>
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center space-x-2">
                            <Lock className="h-4 w-4" />
                            <span className="hidden sm:inline">Security</span>
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center space-x-2">
                            <Bell className="h-4 w-4" />
                            <span className="hidden sm:inline">Notifications</span>
                        </TabsTrigger>
                        <TabsTrigger value="privacy" className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="hidden sm:inline">Privacy</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-6">
                        <SettingsForm />
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6">
                        <PasswordChangeForm />

                        {/* Security Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Lock className="h-5 w-5" />
                                    <span>Security Overview</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <h3 className="font-medium text-green-900">Email Verified</h3>
                                        <p className="text-sm text-green-700 mt-1">
                                            Your email address has been verified
                                        </p>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                        <h3 className="font-medium text-yellow-900">Two-Factor Authentication</h3>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Not enabled - consider enabling for better security
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <h4 className="font-medium mb-2">Recent Activity</h4>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>• Last login: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                                        <p>• Password last changed: {new Date(user.updatedAt).toLocaleDateString()}</p>
                                        <p>• Account created: {new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <NotificationSettings />
                    </TabsContent>

                    <TabsContent value="privacy" className="space-y-6">
                        {/* Data Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Download className="h-5 w-5" />
                                    <span>Data Management</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium mb-2">Export Your Data</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Download a copy of your personal data including profile information,
                                            bookings, and account activity.
                                        </p>
                                        <Button onClick={handleExportData} variant="outline">
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Data
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Deletion */}
                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-red-600">
                                    <Trash2 className="h-5 w-5" />
                                    <span>Danger Zone</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-medium mb-2 text-red-900">Delete Account</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Permanently delete your account and all associated data. This action cannot be undone.
                                    </p>
                                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                                        <div className="text-sm text-red-800">
                                            <strong>Warning:</strong> Deleting your account will:
                                            <ul className="mt-2 space-y-1 list-disc list-inside">
                                                <li>Permanently delete your profile and account data</li>
                                                <li>Cancel all active bookings</li>
                                                <li>Remove access to your booking history</li>
                                                <li>Delete any hosted venues (for host accounts)</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <Button onClick={handleDeleteAccount} variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Account
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
