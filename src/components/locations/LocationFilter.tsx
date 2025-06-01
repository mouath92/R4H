import React, { useState } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface LocationFilterProps {
  onFilter: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  search: string;
  location: string;
  minPrice: number | null;
  maxPrice: number | null;
  amenities: string[];
}

const LocationFilter: React.FC<LocationFilterProps> = ({ onFilter }) => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const applyFilters = () => {
    onFilter({
      search,
      location,
      minPrice,
      maxPrice,
      amenities,
    });
  };

  const resetFilters = () => {
    setSearch('');
    setLocation('');
    setMinPrice(null);
    setMaxPrice(null);
    setAmenities([]);
    onFilter({
      search: '',
      location: '',
      minPrice: null,
      maxPrice: null,
      amenities: [],
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <Input
            placeholder="Search by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
            leftIcon={<Search size={18} className="text-gray-400" />}
          />
        </div>
        <div className="md:w-1/3">
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full"
            leftIcon={<MapPin size={18} className="text-gray-400" />}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="md:w-auto flex items-center gap-2"
          >
            <Filter size={18} />
            Filters
            {amenities.length > 0 && (
              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">
                {amenities.length}
              </span>
            )}
          </Button>
          <Button 
            onClick={applyFilters}
            className="md:w-auto"
          >
            Search
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Price Range</h3>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice !== null ? minPrice : ''}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)}
                  className="w-full"
                />
                <span className="text-gray-400">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice !== null ? maxPrice : ''}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {['WiFi', 'Kitchen', 'Parking', 'Sound System', 'Projector', 'Tables/Chairs', 'Storage'].map((amenity) => (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      amenities.includes(amenity)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button
              onClick={resetFilters}
              variant="outline"
              size="sm"
              className="text-gray-600"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationFilter;