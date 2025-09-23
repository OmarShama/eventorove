import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Landing from "@/pages/landing";
import Search from "@/pages/search";
import VenueDetail from "@/pages/venue-detail";
import Booking from "@/pages/booking";
import HostDashboard from "@/pages/host/dashboard";
import VenueForm from "@/pages/host/venue-form";
import AdminDashboard from "@/pages/admin/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/search" component={Search} />
        <Route path="/venues/:id" component={VenueDetail} />
        <Route path="/book/:venueId" component={Booking} />
        
        {isAuthenticated && user?.role === 'host' && (
          <>
            <Route path="/host/dashboard" component={HostDashboard} />
            <Route path="/host/venues/new" component={VenueForm} />
            <Route path="/host/venues/:id/edit" component={VenueForm} />
          </>
        )}
        
        {isAuthenticated && user?.role === 'admin' && (
          <Route path="/admin/dashboard" component={AdminDashboard} />
        )}
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
