import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { refreshAuth } from "@/hooks/useAuth";

export default function UpgradeToHost() {
    const { user } = useAuth();
    const { toast } = useToast();

    const upgradeMutation = useMutation({
        mutationFn: authApi.upgradeToHost,
        onSuccess: (response) => {
            if (response.success) {
                // Force refresh auth state to get updated user role
                refreshAuth();

                toast({
                    title: "Success",
                    description: "You have been upgraded to host! You can now list and manage venues.",
                });
            }
        },
        onError: (error: any) => {
            toast({
                title: "Upgrade Failed",
                description: error.message || "Failed to upgrade to host role",
                variant: "destructive",
            });
        },
    });

    // Only show for guests
    if (user?.role !== 'guest') {
        return null;
    }

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    <i className="fas fa-crown text-blue-600 text-lg"></i>
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-900">
                        Upgrade to Host
                    </h3>
                    <p className="mt-1 text-sm text-blue-700">
                        Want to list your own venues? Upgrade to host and start earning from bookings.
                    </p>
                    <div className="mt-3">
                        <Button
                            onClick={() => upgradeMutation.mutate()}
                            disabled={upgradeMutation.isPending}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {upgradeMutation.isPending ? "Upgrading..." : "Upgrade to Host"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
