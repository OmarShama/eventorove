import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
// Layout is now handled globally in _app.tsx
import ProfileCard from '@/components/ProfileCard';
import ProfileForm from '@/components/ProfileForm';
import UpgradeToHost from '@/components/UpgradeToHost';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, User } from 'lucide-react';

export default function Profile() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('view');

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
                    <p className="mt-4 text-lg text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

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
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="mt-2 text-gray-600">
                        Manage your account information and preferences
                    </p>
                </div>

                {/* Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="view" className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>View Profile</span>
                        </TabsTrigger>
                        <TabsTrigger value="edit" className="flex items-center space-x-2">
                            <Edit className="h-4 w-4" />
                            <span>Edit Profile</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="view" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <ProfileCard user={user} />
                            </div>
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h3 className="font-medium text-blue-900">Account Type</h3>
                                            <p className="text-2xl font-bold text-blue-600 capitalize">
                                                {user.role}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h3 className="font-medium text-green-900">Member Since</h3>
                                            <p className="text-2xl font-bold text-green-600">
                                                {new Date(user.createdAt).getFullYear()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        <UpgradeToHost />

                                        <Button
                                            onClick={() => setActiveTab('edit')}
                                            className="w-full md:w-auto"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Profile
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="edit" className="space-y-6">
                        <div className="max-w-2xl">
                            <ProfileForm user={user} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
