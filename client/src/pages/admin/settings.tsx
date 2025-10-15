import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Settings, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';

interface PlatformSettings {
  siteName: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotificationsEnabled: boolean;
  maxBookingDays: number;
  platformCommission: number;
  minBookingAmount: number;
  cancellationPeriod: number;
  supportEmail?: string;
  termsOfService?: string;
  privacyPolicy?: string;
}

export default function AdminSettings() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: '',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotificationsEnabled: true,
    maxBookingDays: 365,
    platformCommission: 0.05,
    minBookingAmount: 50,
    cancellationPeriod: 24,
  });

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      router.push('/');
    }
  }, [authLoading, isAuthenticated, user, toast, router]);

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.getSettings(),
    enabled: isAuthenticated && user?.role === 'admin',
  });

  useEffect(() => {
    if ((settingsData as any)?.data) {
      setSettings((settingsData as any).data);
    }
  }, [settingsData]);

  const updateSettingsMutation = useMutation({
    mutationFn: (settingsData: PlatformSettings) => adminApi.updateSettings(settingsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof PlatformSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const resetSettings = () => {
    if ((settingsData as any).data) {
      setSettings((settingsData as any).data);
      toast({
        title: "Settings Reset",
        description: "All changes have been reverted",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="h-8 w-8" />
                System Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Configure platform-wide settings and preferences
              </p>
            </div>

            <div className="flex space-x-2 mt-4 sm:mt-0">
              <Button
                variant="outline"
                onClick={resetSettings}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateSettingsMutation.isPending}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>
                  {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  placeholder="Enter site name"
                />
              </div>

              <div>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail || ''}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                  placeholder="support@yoursite.com"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">
                    Enable to put the site in maintenance mode
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Registration</Label>
                  <p className="text-sm text-gray-500">
                    Allow new users to register accounts
                  </p>
                </div>
                <Switch
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => handleInputChange('registrationEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Enable system email notifications
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotificationsEnabled}
                  onCheckedChange={(checked) => handleInputChange('emailNotificationsEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxBookingDays">Maximum Booking Days in Advance</Label>
                <Input
                  id="maxBookingDays"
                  type="number"
                  value={settings.maxBookingDays}
                  onChange={(e) => handleInputChange('maxBookingDays', parseInt(e.target.value) || 365)}
                  min="1"
                  max="730"
                />
                <p className="text-sm text-gray-500 mt-1">
                  How far in advance users can make bookings (days)
                </p>
              </div>

              <div>
                <Label htmlFor="minBookingAmount">Minimum Booking Amount ($)</Label>
                <Input
                  id="minBookingAmount"
                  type="number"
                  value={settings.minBookingAmount}
                  onChange={(e) => handleInputChange('minBookingAmount', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="cancellationPeriod">Cancellation Period (hours)</Label>
                <Input
                  id="cancellationPeriod"
                  type="number"
                  value={settings.cancellationPeriod}
                  onChange={(e) => handleInputChange('cancellationPeriod', parseInt(e.target.value) || 24)}
                  min="1"
                  max="168"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum hours before event for free cancellation
                </p>
              </div>

              <div>
                <Label htmlFor="platformCommission">Platform Commission (%)</Label>
                <Input
                  id="platformCommission"
                  type="number"
                  value={(settings.platformCommission * 100).toFixed(1)}
                  onChange={(e) => handleInputChange('platformCommission', (parseFloat(e.target.value) || 0) / 100)}
                  min="0"
                  max="30"
                  step="0.1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Percentage commission charged on bookings
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Legal Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Legal Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="termsOfService">Terms of Service</Label>
                <Textarea
                  id="termsOfService"
                  value={settings.termsOfService || ''}
                  onChange={(e) => handleInputChange('termsOfService', e.target.value)}
                  placeholder="Enter terms of service..."
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="privacyPolicy">Privacy Policy</Label>
                <Textarea
                  id="privacyPolicy"
                  value={settings.privacyPolicy || ''}
                  onChange={(e) => handleInputChange('privacyPolicy', e.target.value)}
                  placeholder="Enter privacy policy..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
