import { ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const location = router.pathname;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear token from localStorage
      localStorage.removeItem('token');
      // Refresh the page to reset auth state
      window.location.reload();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      localStorage.removeItem('token');
      // Refresh the page to reset auth state
      window.location.reload();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center" data-testid="logo-link">
                <i className="fas fa-map-marker-alt text-primary text-2xl mr-2"></i>
                <span className="text-2xl font-bold text-primary">Stagea</span>
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="flex items-center space-x-8">
                <Link
                  href="/search"
                  className={`transition-colors ${location.startsWith('/search')
                    ? 'text-primary font-medium'
                    : 'text-foreground hover:text-primary'
                    }`}
                  data-testid="nav-explore"
                >
                  Explore
                </Link>
                {!isLoading && isAuthenticated && user?.role === 'host' && (
                  <Link
                    href="/host/dashboard"
                    className={`transition-colors ${location.startsWith('/host')
                      ? 'text-primary font-medium'
                      : 'text-foreground hover:text-primary'
                      }`}
                    data-testid="nav-host-dashboard"
                  >
                    Host Dashboard
                  </Link>
                )}
                <a
                  href="#help"
                  className="text-foreground hover:text-primary transition-colors"
                  data-testid="nav-help"
                >
                  Help
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {!isLoading && isAuthenticated && user?.role === 'admin' && (
                <Link href="/admin/dashboard">
                  <Button
                    variant="secondary"
                    size="sm"
                    data-testid="nav-admin-dashboard"
                  >
                    Admin
                  </Button>
                </Link>
              )}

              {isLoading ? (
                // Show loading state to prevent hydration mismatch
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" disabled>
                    Loading...
                  </Button>
                </div>
              ) : isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-2" data-testid="user-menu-trigger">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl || ''} />
                        <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/bookings" data-testid="nav-my-bookings">My Bookings</Link>
                    </DropdownMenuItem>
                    {user?.role === 'host' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/host/dashboard" data-testid="nav-host-menu">Host Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/host/venues/new" data-testid="nav-list-venue">List New Venue</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      data-testid="nav-logout"
                      disabled={logoutMutation.isPending}
                    >
                      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild data-testid="nav-login">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild data-testid="nav-signup">
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
