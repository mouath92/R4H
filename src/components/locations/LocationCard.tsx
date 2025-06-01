import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import Card, { CardImage, CardContent, CardTitle, CardFooter } from '../ui/Card';
import { Location } from '../../types';

interface LocationCardProps {
  location: Location;
}

const LocationCard: React.FC<LocationCardProps> = ({ location }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/locations/${location.id}`);
  };

  const handleCheckAvailability = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/locations/${location.id}?booking=true`);
  };

  return (
    <Card 
      elevated 
      className="h-full cursor-pointer hover:transform hover:scale-[1.02] transition-all duration-300"
      onClick={handleClick}
    >
      <CardImage 
        src={location.images?.[0] || ''} 
        alt={location.title} 
        className="h-48"
      />
      <CardContent>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin size={16} className="mr-1" />
          <span className="truncate">{location.address}</span>
        </div>
        <CardTitle className="line-clamp-1">{location.title}</CardTitle>
        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
          {location.description}
        </p>
        <div className="flex items-center text-sm text-gray-700">
          <span className="flex items-center mr-2">
            <Star size={16} className="text-yellow-500 mr-1" />
            {location.rating}
          </span>
          <span className="text-gray-500">({location.reviews} reviews)</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <div className="flex justify-between items-center w-full">
          <div className="text-sm">
            <span className="text-gray-500">Size: </span>
            <span className="font-medium">{location.size}</span>
          </div>
          <div>
            <span className="text-xl font-semibold text-orange-500">${location.pricePerHour}</span>
            <span className="text-gray-500 text-sm"> / hr</span>
          </div>
        </div>
        <button
          onClick={handleCheckAvailability}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Check Availability
        </button>
      </CardFooter>
    </Card>
  );
};

export default LocationCard;