import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LocationCard from '../locations/LocationCard';
import { Location } from '../../types';

const SpacesList: React.FC = () => {
  const [spaces, setSpaces] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      setError(null);

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
          id: space.host?.id || '',
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
    } catch (err) {
      console.error('Error fetching spaces:', err);
      setError('Failed to load spaces');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchSpaces}
          className="mt-4 text-orange-500 hover:text-orange-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {spaces.map((space) => (
        <LocationCard key={space.id} location={space} />
      ))}

      {spaces.length === 0 && (
        <div className="col-span-full text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No spaces available</p>
        </div>
      )}
    </div>
  );
};

export default SpacesList;