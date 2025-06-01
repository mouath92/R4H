import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Star } from 'lucide-react';
import Button from '../components/ui/Button';
import LocationCard from '../components/locations/LocationCard';
import LocationFilter, { FilterOptions } from '../components/locations/LocationFilter';
import { supabase } from '../lib/supabase';
import { Location } from '../types';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Event Planner",
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
    quote: "R4H made it incredibly easy to find and book the perfect venue for our client's product launch. The spaces are unique and the booking process is seamless."
  },
  {
    name: "David Chen",
    role: "Photographer",
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
    quote: "As a photographer, finding the right space for photoshoots used to be a challenge. With R4H, I can quickly browse and book beautiful locations by the hour."
  },
  {
    name: "Maria Rodriguez",
    role: "Small Business Owner",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    quote: "The flexibility of hourly rentals has been a game-changer for my pop-up shop events. R4H has helped me grow my business without the long-term commitment."
  }
];

const Home: React.FC = () => {
  const [spaces, setSpaces] = useState<Location[]>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const { data, error } = await supabase
        .from('spaces')
        .select(`
          *,
          host:users!spaces_host_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('status', 'active');

      if (error) throw error;

      // Transform the data to match our Location type
      const transformedSpaces = data.map(space => ({
        id: space.id,
        title: space.title,
        description: space.description,
        address: space.address,
        price: space.price_per_hour,
        pricePerHour: space.price_per_hour,
        images: space.image_urls || [],
        amenities: space.amenities || [],
        host: {
          id: space.host?.id || 'unknown',
          name: space.host?.name || 'Unknown Host',
          email: space.host?.email || '',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${space.host?.name || 'Unknown'}`,
          phoneNumber: '',
        },
        rating: 4.5,
        reviews: 5,
        coordinates: {
          lat: 4.6097100,
          lng: -74.0817500
        },
        size: `${space.size_m2}m²`,
        maxCapacity: Math.floor(space.size_m2 / 2),
        status: space.status,
        createdAt: space.created_at,
        updatedAt: space.updated_at
      }));

      setSpaces(transformedSpaces);
      setFilteredSpaces(transformedSpaces);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching spaces:', err);
      setError('Failed to load spaces');
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredSpaces(spaces);
      return;
    }

    const filtered = spaces.filter(
      (space) =>
        space.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSpaces(filtered);
  };

  const handleFilter = (filters: FilterOptions) => {
    let filtered = [...spaces];

    if (filters.search) {
      filtered = filtered.filter(
        (space) =>
          space.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          space.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter((space) =>
        space.address.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minPrice !== null) {
      filtered = filtered.filter((space) => space.pricePerHour >= filters.minPrice!);
    }

    if (filters.maxPrice !== null) {
      filtered = filtered.filter((space) => space.pricePerHour <= filters.maxPrice!);
    }

    if (filters.amenities.length > 0) {
      filtered = filtered.filter((space) =>
        filters.amenities.some((amenity) => space.amenities.includes(amenity))
      );
    }

    setFilteredSpaces(filtered);
  };

  return (
    <div>
      <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 h-96">
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/3932930/pexels-photo-3932930.jpeg?auto=compress&cs=tinysrgb&w=1800')" }}
        ></div>
        <div className="relative flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your Perfect Space
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl">
            Discover and rent unique locations for popup shops, events, 
            or meetings — all by the hour
          </p>
          <div className="flex flex-col sm:flex-row w-full max-w-3xl gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="What are you looking for?"
                className="w-full pl-10 pr-4 py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Location"
                className="w-full pl-10 pr-4 py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <Button 
              className="py-3 px-6 font-semibold shadow-md"
              onClick={() => navigate('/locations')}
            >
              Search
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <LocationFilter onFilter={handleFilter} />
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Popular Spaces</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                <div className="bg-white p-4 rounded-b-lg">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map((space) => (
              <LocationCard key={space.id} location={space} />
            ))}
          </div>
        )}
        
        {!loading && !error && filteredSpaces.length === 0 && (
          <div className="text-center py-10">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No spaces found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Booking</h3>
              <p className="text-gray-600">
                Book spaces by the hour. Perfect for popup shops, events, or meetings.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Verified</h3>
              <p className="text-gray-600">
                All locations and hosts are verified. Book with confidence.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Powered</h3>
              <p className="text-gray-600">
                Join thousands of hosts and renters in our growing community.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">What Our Users Say</h2>
          <p className="text-gray-600 text-center mb-10">Trusted by thousands of users worldwide</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{testimonial.name}</h3>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-orange-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Have a space to rent?
          </h2>
          <p className="text-xl text-white mb-8">
            Join our community of hosts and start earning by renting your space by the hour.
          </p>
          <Button 
            variant="secondary" 
            size="lg"
            className="shadow-lg hover:shadow-xl transition-shadow duration-300"
            onClick={() => navigate('/list-space')}
          >
            Become a Host
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;