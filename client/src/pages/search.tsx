import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { config } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import SearchBar from "@/components/SearchBar";
import VenueCard from "@/components/VenueCard";
import EmptyState from "@/components/EmptyState";
import { VenueSearchRequest } from "@/types/api";

export default function Search() {
  const router = useRouter();
  const [filters, setFilters] = useState<VenueSearchRequest>({
    page: 1,
    limit: 20,
  });

  // Parse URL parameters on mount
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR safety check
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters: VenueSearchRequest = {
      page: 1,
      limit: 20,
    };

    if (urlParams.get('q')) initialFilters.q = urlParams.get('q')!;
    if (urlParams.get('city')) initialFilters.city = urlParams.get('city')!;
    if (urlParams.get('category')) initialFilters.category = urlParams.get('category')!;
    if (urlParams.get('availableAt')) initialFilters.availableAt = urlParams.get('availableAt')!;
    if (urlParams.get('durationMinutes')) initialFilters.durationMinutes = parseInt(urlParams.get('durationMinutes')!);
    if (urlParams.get('capacityMin')) initialFilters.capacityMin = parseInt(urlParams.get('capacityMin')!);
    if (urlParams.get('priceMin')) initialFilters.priceMin = parseFloat(urlParams.get('priceMin')!);
    if (urlParams.get('priceMax')) initialFilters.priceMax = parseFloat(urlParams.get('priceMax')!);

    setFilters(initialFilters);
  }, []);

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['/api/venues/search', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, value.toString());
        }
      });

      const response = await fetch(`${config.apiUrl}/venues/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to search venues');
      }
      const result = await response.json();
      return result.data; // Extract the data from the API response
    },
  });

  const handleSearch = (newFilters: Partial<VenueSearchRequest>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);

    // Update URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });
    router.push(`/search?${params.toString()}`);
  };

  const handleFilterChange = (key: keyof VenueSearchRequest, value: any) => {
    handleSearch({ [key]: value });
  };

  const handleLoadMore = () => {
    setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
          <p className="text-muted-foreground">Failed to load venues. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  data-testid="back-button"
                >
                  <i className="fas fa-arrow-left"></i>
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold text-foreground">Search Results</h1>
              {searchResults && (
                <span className="text-muted-foreground" data-testid="results-count">
                  {searchResults.total} venues found
                </span>
              )}
            </div>
            <Button
              variant="outline"
              className="lg:hidden"
              data-testid="mobile-filters-button"
            >
              <i className="fas fa-filter mr-2"></i>Filters
            </Button>
          </div>

          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border sticky top-24">
              <h3 className="text-xl font-semibold text-foreground mb-6">Filters</h3>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Price Range (EGP/hour)
                </label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin || ''}
                    onChange={(e) => handleFilterChange('priceMin', parseFloat(e.target.value) || undefined)}
                    data-testid="price-min-input"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceMax || ''}
                    onChange={(e) => handleFilterChange('priceMax', parseFloat(e.target.value) || undefined)}
                    data-testid="price-max-input"
                  />
                </div>
              </div>

              {/* Capacity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">Capacity</label>
                <Select
                  value={filters.capacityMin?.toString() || 'any'}
                  onValueChange={(value) => handleFilterChange('capacityMin', (value && value !== 'any') ? parseInt(value) : undefined)}
                >
                  <SelectTrigger data-testid="capacity-filter">
                    <SelectValue placeholder="Any size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any size</SelectItem>
                    <SelectItem value="1">1-10 people</SelectItem>
                    <SelectItem value="11">11-50 people</SelectItem>
                    <SelectItem value="51">51-100 people</SelectItem>
                    <SelectItem value="101">100+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">Amenities</label>
                <div className="space-y-3">
                  {['Wi-Fi', 'Parking', 'A/V Equipment', 'Catering'].map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={(filters.amenities || []).includes(amenity)}
                        onCheckedChange={(checked) => {
                          const currentAmenities = filters.amenities || [];
                          const newAmenities = checked
                            ? [...currentAmenities, amenity]
                            : currentAmenities.filter(a => a !== amenity);
                          handleFilterChange('amenities', newAmenities.length > 0 ? newAmenities : undefined);
                        }}
                        data-testid={`amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                      <label
                        htmlFor={amenity}
                        className="text-sm text-foreground cursor-pointer"
                      >
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => setFilters({ page: 1, limit: 20 })}
                data-testid="clear-filters-button"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* View Toggle */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="default"
                  size="sm"
                  data-testid="list-view-button"
                >
                  List
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  data-testid="map-view-button"
                >
                  Map
                </Button>
              </div>
              <Select value="best-match" onValueChange={() => { }}>
                <SelectTrigger className="w-48" data-testid="sort-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="best-match">Best Match</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Venue Grid */}
            {searchResults && searchResults.venues && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-testid="venues-grid">
                  {searchResults.venues.map((venue: any) => (
                    <VenueCard key={venue.id} venue={venue} />
                  ))}
                </div>

                {/* Load More */}
                {searchResults.venues.length < searchResults.total && (
                  <div className="text-center mt-12">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      data-testid="load-more-button"
                    >
                      Load More Venues
                    </Button>
                  </div>
                )}

                {/* No Results */}
                {searchResults.venues.length === 0 && (
                  <EmptyState
                    icon="fas fa-search"
                    title="No venues found"
                    description="We couldn't find any venues matching your criteria. Try adjusting your search or explore different options."
                    actions={[
                      {
                        label: "Clear All Filters",
                        variant: "outline",
                        icon: "fas fa-refresh",
                        onClick: () => {
                          // Clear all filters
                          if (typeof window !== 'undefined') {
                            const newUrl = new URL(window.location.href);
                            newUrl.search = '';
                            window.history.pushState({}, '', newUrl.toString());
                            window.location.reload();
                          }
                        }
                      },
                      {
                        label: "Back to Home",
                        variant: "default",
                        icon: "fas fa-home",
                        onClick: () => router.push('/')
                      }
                    ]}
                  />
                )}
              </>
            )}

            {/* Handle case where searchResults exists but venues is undefined */}
            {searchResults && !searchResults.venues && (
              <EmptyState
                icon="fas fa-exclamation-triangle"
                title="Error loading venues"
                description="There was an issue loading the venue data. Please try again."
                actions={[
                  {
                    label: "Retry Search",
                    variant: "default",
                    icon: "fas fa-refresh",
                    onClick: () => {
                      if (typeof window !== 'undefined') {
                        window.location.reload();
                      }
                    }
                  },
                  {
                    label: "Back to Home",
                    variant: "outline",
                    icon: "fas fa-home",
                    onClick: () => router.push('/')
                  }
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
