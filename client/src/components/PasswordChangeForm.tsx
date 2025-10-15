import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock } from 'lucide-react';

interface PasswordChangeFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function PasswordChangeForm() {
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
        watch,
    } = useForm<PasswordChangeFormData>();

    const newPassword = watch('newPassword');

    const changePasswordMutation = useMutation({
        mutationFn: authApi.changePassword,
        onSuccess: (response) => {
            if (response.success) {
                toast({
                    title: 'Success',
                    description: 'Password changed successfully',
                });
                reset();
            }
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to change password',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (data: PasswordChangeFormData) => {
        changePasswordMutation.mutate({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5" />
                    <span>Change Password</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            {...register('currentPassword', {
                                required: 'Current password is required',
                            })}
                            placeholder="Enter your current password"
                        />
                        {errors.currentPassword && (
                            <p className="text-sm text-red-600">{errors.currentPassword.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            {...register('newPassword', {
                                required: 'New password is required',
                                minLength: {
                                    value: 8,
                                    message: 'Password must be at least 8 characters long',
                                },
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                                    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                                },
                            })}
                            placeholder="Enter your new password"
                        />
                        {errors.newPassword && (
                            <p className="text-sm text-red-600">{errors.newPassword.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            {...register('confirmPassword', {
                                required: 'Please confirm your new password',
                                validate: (value) =>
                                    value === newPassword || 'Passwords do not match',
                            })}
                            placeholder="Confirm your new password"
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="text-sm text-yellow-800">
                            <strong>Password Requirements:</strong>
                            <ul className="mt-2 space-y-1 list-disc list-inside">
                                <li>At least 8 characters long</li>
                                <li>Contains uppercase and lowercase letters</li>
                                <li>Contains at least one number</li>
                                <li>Contains at least one special character (@$!%*?&)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => reset()}
                            disabled={changePasswordMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isDirty || changePasswordMutation.isPending}
                        >
                            {changePasswordMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Change Password
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
