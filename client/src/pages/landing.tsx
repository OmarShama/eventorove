import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  {
    name: "Meeting Rooms",
    description: "Professional spaces for teams",
    icon: "fas fa-users",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Event Halls",
    description: "Celebrate your special moments",
    icon: "fas fa-glass-cheers",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Creative Studios",
    description: "Spaces for artists and creators",
    icon: "fas fa-camera",
    image: "https://images.unsplash.com/photo-1571624436279-b272aff752b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Outdoor Spaces",
    description: "Beautiful open-air venues",
    icon: "fas fa-tree",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

export default function Landing() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDateTime, setSelectedDateTime] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedDateTime) params.set('availableAt', selectedDateTime);

    router.push(`/search?${params.toString()}`);
  };

  const handleCategoryClick = (category: string) => {
    router.push(`/search?category=${encodeURIComponent(category)}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Find Your Perfect
            <span className="text-secondary"> Venue</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-2xl mx-auto">
            Discover and book premium venues instantly across Cairo. From elegant halls to creative studios.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-2xl max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                  <Input
                    type="text"
                    placeholder="Search venues, events, or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-input bg-background text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    data-testid="search-input"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <i className="fas fa-calendar-alt absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                  <Input
                    type="datetime-local"
                    value={selectedDateTime}
                    onChange={(e) => setSelectedDateTime(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-input bg-background text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    data-testid="datetime-input"
                  />
                </div>
              </div>
              <div className="flex-shrink-0">
                <Button
                  onClick={handleSearch}
                  className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold transition-colors flex items-center justify-center"
                  data-testid="search-button"
                >
                  <i className="fas fa-search mr-2"></i>
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-center space-x-8 mt-12 text-sm text-gray-300">
            <div className="flex items-center">
              <i className="fas fa-clock mr-2 text-secondary"></i>
              <span>Instant Booking</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-credit-card mr-2 text-secondary"></i>
              <span>Pay at Venue</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-map-marked-alt mr-2 text-secondary"></i>
              <span>Cairo Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Explore by Category</h2>
            <p className="text-xl text-muted-foreground">Discover the perfect space for every occasion</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <div
                key={index}
                className="group cursor-pointer"
                onClick={() => handleCategoryClick(category.name)}
                data-testid={`category-${index}`}
              >
                <div
                  className="relative rounded-2xl overflow-hidden mb-4 aspect-square"
                  style={{
                    backgroundImage: `url('${category.image}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-60 transition-all duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className={`${category.icon} text-white text-4xl`}></i>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-muted-foreground mt-1">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How Stagea Works</h2>
            <p className="text-xl text-muted-foreground">Book your perfect venue in minutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-search text-primary-foreground text-2xl"></i>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">1. Search & Discover</h3>
              <p className="text-muted-foreground">
                Browse thousands of verified venues with photos, amenities, and real-time availability.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-calendar-check text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">2. Book Instantly</h3>
              <p className="text-muted-foreground">
                Select your time slot and confirm your booking immediately. No waiting for approval.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-handshake text-accent-foreground text-2xl"></i>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">3. Pay at Venue</h3>
              <p className="text-muted-foreground">
                Enjoy your event and pay directly at the venue. No hidden fees or upfront payments.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
