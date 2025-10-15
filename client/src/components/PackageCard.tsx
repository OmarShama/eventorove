import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Package, 
  Clock, 
  DollarSign, 
  Users, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star
} from 'lucide-react';

export interface VenuePackage {
  id: string;
  name: string;
  description: string;
  priceEGP: number;
  durationMinutes: number;
  maxGuests?: number;
  isPopular?: boolean;
  isActive: boolean;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

interface PackageCardProps {
  package: VenuePackage;
  onEdit: (packageData: VenuePackage) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onView?: (packageData: VenuePackage) => void;
}

export default function PackageCard({
  package: pkg,
  onEdit,
  onDelete,
  onToggleActive,
  onView,
}: PackageCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${pkg.name}"? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await onDelete(pkg.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    } else if (minutes % 60 === 0) {
      return `${minutes / 60}h`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}min`;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className={`relative transition-all duration-200 ${!pkg.isActive ? 'opacity-75' : ''}`}>
      {pkg.isPopular && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Star className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              {pkg.name}
              {!pkg.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Inactive
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {pkg.description}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(pkg)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(pkg)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Package
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onToggleActive(pkg.id, !pkg.isActive)}
                className={pkg.isActive ? 'text-orange-600' : 'text-green-600'}
              >
                <Package className="h-4 w-4 mr-2" />
                {pkg.isActive ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price and Duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-2xl font-bold text-green-600">
            <DollarSign className="h-5 w-5" />
            {formatPrice(pkg.priceEGP)}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            {formatDuration(pkg.durationMinutes)}
          </div>
        </div>

        {/* Max Guests */}
        {pkg.maxGuests && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>Up to {pkg.maxGuests} guests</span>
          </div>
        )}

        {/* Features */}
        {pkg.features && pkg.features.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-2">Includes:</h4>
            <div className="space-y-1">
              {pkg.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  <span>{feature}</span>
                </div>
              ))}
              {pkg.features.length > 3 && (
                <div className="text-xs text-gray-500 ml-3">
                  +{pkg.features.length - 3} more features
                </div>
              )}
            </div>
          </div>
        )}

        {/* Meta Information */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Created {new Date(pkg.createdAt).toLocaleDateString()}</span>
            {pkg.updatedAt !== pkg.createdAt && (
              <span>Updated {new Date(pkg.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(pkg)}
            className="flex-1"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant={pkg.isActive ? "secondary" : "default"}
            size="sm" 
            onClick={() => onToggleActive(pkg.id, !pkg.isActive)}
            className="flex-1"
          >
            {pkg.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
