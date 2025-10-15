import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFiltersProps {
  onFiltersChange: (filters: { role: string; search: string }) => void;
  initialFilters?: { role: string; search: string };
}

export default function UserFilters({ onFiltersChange, initialFilters }: UserFiltersProps) {
  const [role, setRole] = useState(initialFilters?.role || 'all');
  const [search, setSearch] = useState(initialFilters?.search || '');

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    onFiltersChange({ role: newRole, search });
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    onFiltersChange({ role, search: newSearch });
  };

  const clearFilters = () => {
    setRole('all');
    setSearch('');
    onFiltersChange({ role: 'all', search: '' });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="sm:w-48">
        <Select value={role} onValueChange={handleRoleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="guest">Guests</SelectItem>
            <SelectItem value="host">Hosts</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(role !== 'all' || search) && (
        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
