import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Star
} from 'lucide-react';
import PackageCard, { VenuePackage } from './PackageCard';

interface PackageListProps {
  packages: VenuePackage[];
  onAdd: () => void;
  onEdit: (packageData: VenuePackage) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onView?: (packageData: VenuePackage) => void;
  isLoading?: boolean;
}

type SortOption = 'name' | 'price' | 'duration' | 'created' | 'updated';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'active' | 'inactive' | 'popular';
type ViewMode = 'grid' | 'list';

export default function PackageList({
  packages,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
  onView,
  isLoading = false,
}: PackageListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Filter packages based on search and status
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && pkg.isActive) ||
      (filterStatus === 'inactive' && !pkg.isActive) ||
      (filterStatus === 'popular' && pkg.isPopular);

    return matchesSearch && matchesStatus;
  });

  // Sort packages
  const sortedPackages = [...filteredPackages].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = a.priceEGP - b.priceEGP;
        break;
      case 'duration':
        comparison = a.durationMinutes - b.durationMinutes;
        break;
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updated':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getStatusCounts = () => {
    return {
      all: packages.length,
      active: packages.filter(p => p.isActive).length,
      inactive: packages.filter(p => !p.isActive).length,
      popular: packages.filter(p => p.isPopular).length,
    };
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Package Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage pricing packages for your venue
              </p>
            </div>
            <Button onClick={onAdd} className="self-start">
              <Plus className="h-4 w-4 mr-2" />
              Create Package
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages ({statusCounts.all})</SelectItem>
                <SelectItem value="active">Active ({statusCounts.active})</SelectItem>
                <SelectItem value="inactive">Inactive ({statusCounts.inactive})</SelectItem>
                <SelectItem value="popular">Popular ({statusCounts.popular})</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-full lg:w-36">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="px-3"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>

            {/* View Mode */}
            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status Summary */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="text-sm">
              {statusCounts.all} Total
            </Badge>
            <Badge variant="outline" className="text-sm text-green-600">
              {statusCounts.active} Active
            </Badge>
            <Badge variant="outline" className="text-sm text-gray-600">
              {statusCounts.inactive} Inactive
            </Badge>
            <Badge variant="outline" className="text-sm text-yellow-600">
              <Star className="h-3 w-3 mr-1" />
              {statusCounts.popular} Popular
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Package List */}
      {sortedPackages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            {searchTerm || filterStatus !== 'all' ? (
              <div>
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div>
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first package to start offering different pricing options to your customers
                </p>
                <Button onClick={onAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Package
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
          }
        >
          {sortedPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              onView={onView}
            />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {sortedPackages.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {sortedPackages.length} of {packages.length} packages
        </div>
      )}
    </div>
  );
}
