import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Settings, Globe, Clock, Palette } from 'lucide-react';

interface UserSettings {
    language: string;
    timezone: string;
    theme: string;
    dateFormat: string;
    timeFormat: string;
    emailFrequency: string;
    autoSave: boolean;
    twoFactorAuth: boolean;
}

export default function SettingsForm() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [settings, setSettings] = useState<UserSettings>({
        language: 'en',
        timezone: 'UTC',
        theme: 'light',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        emailFrequency: 'daily',
        autoSave: true,
        twoFactorAuth: false,
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleSettingChange = (key: keyof UserSettings, value: string | boolean) => {
        setSettings(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // TODO: Implement API call to save user settings
            // await authApi.updateSettings(settings);
            toast({
                title: 'Success',
                description: 'Settings updated successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update settings',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>General Settings</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Localization Settings */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <h3>Localization</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                        <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <Select
                                value={settings.language}
                                onValueChange={(value) => handleSettingChange('language', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Español</SelectItem>
                                    <SelectItem value="fr">Français</SelectItem>
                                    <SelectItem value="de">Deutsch</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select
                                value={settings.timezone}
                                onValueChange={(value) => handleSettingChange('timezone', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UTC">UTC</SelectItem>
                                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                    <SelectItem value="Europe/London">London</SelectItem>
                                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Display Settings */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                        <Palette className="h-4 w-4" />
                        <h3>Display</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                        <div className="space-y-2">
                            <Label htmlFor="theme">Theme</Label>
                            <Select
                                value={settings.theme}
                                onValueChange={(value) => handleSettingChange('theme', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateFormat">Date Format</Label>
                            <Select
                                value={settings.dateFormat}
                                onValueChange={(value) => handleSettingChange('dateFormat', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select date format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timeFormat">Time Format</Label>
                            <Select
                                value={settings.timeFormat}
                                onValueChange={(value) => handleSettingChange('timeFormat', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="12h">12 Hour</SelectItem>
                                    <SelectItem value="24h">24 Hour</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Email Settings */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <h3>Email Preferences</h3>
                    </div>
                    <div className="pl-6">
                        <div className="space-y-2">
                            <Label htmlFor="emailFrequency">Email Summary Frequency</Label>
                            <Select
                                value={settings.emailFrequency}
                                onValueChange={(value) => handleSettingChange('emailFrequency', value)}
                            >
                                <SelectTrigger className="max-w-xs">
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="immediate">Immediate</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="never">Never</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Security & Features */}
                <div className="space-y-4">
                    <div className="space-y-3 pl-6">
                        <div className="flex items-center justify-between space-x-4">
                            <div>
                                <Label htmlFor="autoSave" className="text-sm font-medium cursor-pointer">
                                    Auto-save Changes
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Automatically save form changes as you type
                                </p>
                            </div>
                            <Switch
                                id="autoSave"
                                checked={settings.autoSave}
                                onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-4">
                            <div>
                                <Label htmlFor="twoFactorAuth" className="text-sm font-medium cursor-pointer">
                                    Two-Factor Authentication
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Add an extra layer of security to your account
                                </p>
                            </div>
                            <Switch
                                id="twoFactorAuth"
                                checked={settings.twoFactorAuth}
                                onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                            />
                        </div>
                    </div>
                </div>

                {/* Account Info */}
                {user && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Account Information</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Account Type:</strong> <span className="capitalize">{user.role}</span></p>
                            <p><strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                            <p><strong>Last Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="pt-4 border-t">
                    <div className="flex justify-end space-x-2">
                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
