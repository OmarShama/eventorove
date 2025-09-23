import { useEffect, useRef, useState } from "react";
import { VenueWithDetails } from "@shared/schema";

interface MapViewProps {
  venues?: VenueWithDetails[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onVenueClick?: (venue: VenueWithDetails) => void;
  selectedVenueId?: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function MapView({
  venues = [],
  center = { lat: 30.0444, lng: 31.2357 }, // Cairo center
  zoom = 11,
  height = "400px",
  onVenueClick,
  selectedVenueId,
  className = "",
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check if Google Maps is available
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
      } else {
        // Retry after a short delay
        setTimeout(checkGoogleMaps, 100);
      }
    };

    checkGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const mapOptions = {
      center,
      zoom,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
  }, [isLoaded, center, zoom]);

  // Update markers when venues change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    venues.forEach(venue => {
      if (!venue.lat || !venue.lng) return;

      const lat = parseFloat(venue.lat);
      const lng = parseFloat(venue.lng);

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: venue.title,
        icon: {
          url: selectedVenueId === venue.id 
            ? "data:image/svg+xml;charset=UTF-8,%3csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='20' cy='20' r='15' fill='%231982C4'/%3e%3ccircle cx='20' cy='20' r='8' fill='white'/%3e%3c/svg%3e"
            : "data:image/svg+xml;charset=UTF-8,%3csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='16' cy='16' r='12' fill='%2348CAE4'/%3e%3ccircle cx='16' cy='16' r='6' fill='white'/%3e%3c/svg%3e",
          scaledSize: new window.google.maps.Size(
            selectedVenueId === venue.id ? 40 : 32,
            selectedVenueId === venue.id ? 40 : 32
          ),
        },
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2 max-w-xs">
            <h3 class="font-semibold text-foreground mb-1">${venue.title}</h3>
            <p class="text-sm text-muted-foreground mb-2">${venue.address}, ${venue.city}</p>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Up to ${venue.capacity} people</span>
              <span class="font-semibold text-primary">₪${venue.baseHourlyPriceEGP}/hour</span>
            </div>
          </div>
        `,
      });

      marker.addListener("click", () => {
        if (onVenueClick) {
          onVenueClick(venue);
        }
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (venues.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      venues.forEach(venue => {
        if (venue.lat && venue.lng) {
          bounds.extend({ lat: parseFloat(venue.lat), lng: parseFloat(venue.lng) });
        }
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [venues, selectedVenueId, onVenueClick]);

  if (!isLoaded) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef}
      className={`rounded-lg overflow-hidden ${className}`}
      style={{ height }}
      data-testid="google-map"
    />
  );
}
