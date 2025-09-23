import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchBarProps {
  onSearch: (filters: {
    q?: string;
    city?: string;
    category?: string;
    availableAt?: string;
    durationMinutes?: number;
  }) => void;
  className?: string;
}

export default function SearchBar({ onSearch, className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [duration, setDuration] = useState(60);

  const handleSearch = () => {
    onSearch({
      q: query || undefined,
      city: (city && city !== 'any-city') ? city : undefined,
      category: (category && category !== 'any-category') ? category : undefined,
      availableAt: dateTime || undefined,
      durationMinutes: duration,
    });
  };

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-lg border border-border ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
          <Input
            type="text"
            placeholder="Search venues..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            data-testid="search-query-input"
          />
        </div>
        
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger data-testid="city-select">
            <SelectValue placeholder="Any City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any-city">Any City</SelectItem>
            <SelectItem value="New Cairo">New Cairo</SelectItem>
            <SelectItem value="Heliopolis">Heliopolis</SelectItem>
            <SelectItem value="Zamalek">Zamalek</SelectItem>
            <SelectItem value="Maadi">Maadi</SelectItem>
            <SelectItem value="Dokki">Dokki</SelectItem>
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger data-testid="category-select">
            <SelectValue placeholder="Any Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any-category">Any Category</SelectItem>
            <SelectItem value="Meeting Rooms">Meeting Rooms</SelectItem>
            <SelectItem value="Event Halls">Event Halls</SelectItem>
            <SelectItem value="Creative Studios">Creative Studios</SelectItem>
            <SelectItem value="Outdoor Spaces">Outdoor Spaces</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          data-testid="datetime-select"
        />

        <Button 
          onClick={handleSearch}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          data-testid="search-submit-button"
        >
          <i className="fas fa-search mr-2"></i>
          Search
        </Button>
      </div>
    </div>
  );
}
