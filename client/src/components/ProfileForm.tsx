import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { User } from '@/types/api';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload } from 'lucide-react';
import { refreshAuth } from '@/hooks/useAuth';

interface ProfileFormProps {
    user: User;
}

interface ProfileFormData {
    firstName: string;
    lastName: string;
    profileImageUrl: string;
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [imagePreview, setImagePreview] = useState(user.profileImageUrl || '');

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        setValue,
        watch,
    } = useForm<ProfileFormData>({
        defaultValues: {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            profileImageUrl: user.profileImageUrl || '',
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: authApi.updateProfile,
        onSuccess: (response) => {
            if (response.success) {
                toast({
                    title: 'Success',
                    description: 'Profile updated successfully',
                });
                // Refresh auth state to get updated user data
                refreshAuth();
                // Invalidate relevant queries
                queryClient.invalidateQueries({ queryKey: ['user'] });
            }
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update profile',
                variant: 'destructive',
            });
        },
    });

    const handleImageUrlChange = (url: string) => {
        setValue('profileImageUrl', url, { shouldDirty: true });
        setImagePreview(url);
    };

    const onSubmit = (data: ProfileFormData) => {
        updateProfileMutation.mutate(data);
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
    };

    const watchedFirstName = watch('firstName');
    const watchedLastName = watch('lastName');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Profile Image Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={imagePreview} />
                            <AvatarFallback className="text-2xl">
                                {getInitials(watchedFirstName, watchedLastName)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="w-full max-w-md space-y-2">
                            <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                            <div className="flex space-x-2">
                                <Input
                                    id="profileImageUrl"
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    {...register('profileImageUrl')}
                                    onChange={(e) => handleImageUrlChange(e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        // In a real app, this would trigger an image upload dialog
                                        const url = prompt('Enter image URL:');
                                        if (url) handleImageUrlChange(url);
                                    }}
                                >
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                {...register('firstName', {
                                    required: 'First name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'First name must be at least 2 characters',
                                    },
                                })}
                                placeholder="Enter your first name"
                            />
                            {errors.firstName && (
                                <p className="text-sm text-red-600">{errors.firstName.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                {...register('lastName', {
                                    required: 'Last name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Last name must be at least 2 characters',
                                    },
                                })}
                                placeholder="Enter your last name"
                            />
                            {errors.lastName && (
                                <p className="text-sm text-red-600">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={user.email}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-sm text-muted-foreground">
                            Email address cannot be changed. Contact support if you need to update this.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-2">
                        <Button
                            type="submit"
                            disabled={!isDirty || updateProfileMutation.isPending}
                        >
                            {updateProfileMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
