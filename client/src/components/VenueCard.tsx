import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VenueWithDetails } from "@/types/api";

interface VenueCardProps {
  venue: VenueWithDetails;
}

export default function VenueCard({ venue }: VenueCardProps) {
  const mainImage = venue.images?.[0]?.path || "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  return (
    <Card className="venue-card bg-card rounded-2xl shadow-sm border border-border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/venues/${venue.id}`}>
        <div
          className="relative h-64"
          style={{
            backgroundImage: `url('${mainImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute top-4 left-4">
            <Badge className="bg-accent text-accent-foreground">
              <i className="fas fa-bolt mr-1"></i>Instant Book
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/90 text-foreground w-8 h-8 rounded-full p-0 hover:bg-white"
              data-testid={`favorite-${venue.id}`}
            >
              <i className="far fa-heart"></i>
            </Button>
          </div>
          <div className="absolute bottom-4 left-4">
            <Badge variant="secondary" className="bg-black/70 text-white">
              <i className="fas fa-images mr-1"></i>{venue.images?.length || 1} photos
            </Badge>
          </div>
        </div>
      </Link>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-semibold text-foreground line-clamp-1">
              {venue.title}
            </h3>
            <p className="text-muted-foreground flex items-center mt-1">
              <i className="fas fa-map-marker-alt mr-1 text-primary"></i>
              <span className="line-clamp-1">{venue.address}, {venue.city}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center mb-1">
              <i className="fas fa-star text-secondary mr-1"></i>
              <span className="text-sm font-medium">4.8</span>
              <span className="text-muted-foreground text-sm ml-1">(24)</span>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {venue.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {venue.amenities?.slice(0, 3).map((amenity, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-muted text-muted-foreground text-xs"
            >
              {amenity.name}
            </Badge>
          ))}
          {venue.amenities && venue.amenities.length > 3 && (
            <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
              +{venue.amenities.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <i className="fas fa-users mr-2"></i>
            <span>Up to {venue.capacity} people</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              ₪{venue.baseHourlyPriceEGP}
            </div>
            <div className="text-sm text-muted-foreground">per hour</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
