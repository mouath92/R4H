import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, Users, ArrowLeft, Check, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import BookingCalendar from '../components/bookings/BookingCalendar';
import PaymentForm from '../components/payments/PaymentForm';
import PaymentConfirmation from '../components/payments/PaymentConfirmation';
import ChatDialog from '../components/messaging/ChatDialog';
import LeafletMap from '../components/maps/LeafletMap';
import { Location, Booking } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const LocationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedHours, setSelectedHours] = useState<number | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('credit_card');
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hostAvatar, setHostAvatar] = useState<string | null>(null);

  useEffect(() => {
    fetchLocationDetails();
  }, [id]);

  const fetchLocationDetails = async () => {
    try {
      if (!id) {
        throw new Error('Location ID is required');
      }

      const { data, error } = await supabase
        .from('spaces')
        .select(`
          *,
          host:users!spaces_host_id_fkey (
            id,
            name,
            email,
            role,
            avatar_url
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error('Location not found');
      }

      const hostData = data.host || {
        id: 'unknown',
        name: 'Unknown Host',
        email: '',
        role: 'user',
        avatar_url: null
      };

      if (hostData.avatar_url) {
        const { data: { publicUrl } } = supabase
          .storage
          .from('profile-pictures')
          .getPublicUrl(hostData.avatar_url);
        setHostAvatar(publicUrl);
      }

      const transformedLocation: Location = {
        id: data.id,
        title: data.title,
        description: data.description,
        address: data.address,
        price: data.price_per_hour,
        pricePerHour: data.price_per_hour,
        images: data.image_urls || [],
        amenities: data.amenities || [],
        host: {
          id: hostData.id,
          name: hostData.name,
          email: hostData.email,
          avatar: hostData.avatar_url ? hostAvatar : `https://api.dicebear.com/7.x/initials/svg?seed=${hostData.name}`,
          phoneNumber: '',
        },
        rating: 4.5,
        reviews: 5,
        coordinates: {
          lat: 4.6097100,
          lng: -74.0817500
        },
        size: `${data.size_m2}m²`,
        maxCapacity: Math.floor(data.size_m2 / 2),
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setLocation(transformedLocation);
      setError(null);
    } catch (err) {
      console.error('Error fetching location:', err);
      setError(err instanceof Error ? err.message : 'Failed to load location details');
      setLocation(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevImage = () => {
    if (!location?.images) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? location.images.length - 1 : prevIndex - 1
    );
  };
  
  const handleNextImage = () => {
    if (!location?.images) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === location.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };
  
  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
  };

  const handleSelectHours = (hours: number) => {
    setSelectedHours(hours);
  };
  
  const calculateTotal = () => {
    if (!selectedHours || !location) return 0;
    return location.pricePerHour * selectedHours;
  };

  const calculateEndTime = (startTime: string, hours: number): string => {
    const [hoursStr, minutesStr] = startTime.split(':');
    const startHours = parseInt(hoursStr, 10);
    const startMinutes = parseInt(minutesStr, 10);
    
    const totalMinutes = startMinutes + (hours * 60);
    const endHours = Math.floor((startHours + totalMinutes / 60) % 24);
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleStartBooking = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/locations/${id}` } });
      return;
    }
    setShowBookingForm(true);
  };
  
  const handleBook = () => {
    if (selectedDate && selectedTime && selectedHours && location) {
      const startTime = selectedTime;
      const endTime = calculateEndTime(startTime, selectedHours);

      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        locationId: location.id,
        userId: user?.id || '',
        date: selectedDate,
        startTime: startTime,
        endTime: endTime,
        status: 'confirmed',
        totalPrice: calculateTotal(),
        hours: selectedHours,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: 'pending'
      };

      setBooking(newBooking);
      setShowPaymentForm(true);
    }
  };

  const handlePaymentSubmit = async (paymentDetails: any) => {
    if (booking && location && user) {
      try {
        const { data: newBooking, error } = await supabase
          .from('bookings')
          .insert({
            user_id: user.id,
            space_id: location.id,
            date: booking.date,
            start_time: booking.startTime,
            end_time: booking.endTime,
            duration_hours: booking.hours,
            total_price: booking.totalPrice,
            status: 'pending',
            host_confirmation_status: 'pending',
            payment_method: selectedPaymentMethod,
            payment_status: 'paid'
          })
          .select()
          .single();

        if (error) throw error;

        const confirmedBooking = {
          ...booking,
          id: newBooking.id,
          paymentStatus: 'paid'
        };

        setBooking(confirmedBooking);
        setShowPaymentForm(false);
        setShowPaymentConfirmation(true);

      } catch (error) {
        console.error('Error creating booking:', error);
        alert('Failed to create booking. Please try again.');
      }
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setBooking(null);
  };
  
  const toggleBookingForm = () => {
    setShowBookingForm(!showBookingForm);
  };

  const handleContactHost = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/locations/${id}` } });
      return;
    }
    setShowChatDialog(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded mb-8"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Location</h2>
          <p className="text-red-600">{error}</p>
          <Button
            onClick={() => navigate('/')}
            className="mt-4"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Location Not Found</h2>
          <p className="text-yellow-600">The requested location could not be found.</p>
          <Button
            onClick={() => navigate('/')}
            className="mt-4"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="flex items-center text-orange-500 hover:underline">
          <ArrowLeft size={16} className="mr-1" />
          Back to listings
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{location.title}</h1>
          <div className="flex items-center text-gray-600">
            <MapPin size={18} className="mr-1" />
            <span>{location.address}</span>
          </div>
        </div>
        <div className="mt-2 md:mt-0 flex items-center">
          <Star size={20} className="text-yellow-500 mr-1" />
          <span className="font-semibold">{location.rating}</span>
          <span className="text-gray-500 ml-1">({location.reviews} reviews)</span>
        </div>
      </div>
      
      <div className="relative mb-8 bg-gray-100 rounded-lg overflow-hidden">
        {location.images && location.images.length > 0 ? (
          <img 
            src={location.images[currentImageIndex]} 
            alt={`${location.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-96 object-cover"
          />
        ) : (
          <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">No images available</p>
          </div>
        )}
        
        {location.images && location.images.length > 1 && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {location.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-start">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 mr-4">
                {hostAvatar ? (
                  <img 
                    src={hostAvatar} 
                    alt={location.host.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-orange-500 flex items-center justify-center text-white text-2xl font-semibold">
                    {location.host.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Hosted by {location.host.name}</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                  onClick={handleContactHost}
                >
                  <MessageCircle size={16} className="mr-1" />
                  Contact Host
                </Button>
              </div>
            </div>
            <hr className="my-6" />
            <h3 className="text-xl font-semibold mb-4">About this space</h3>
            <p className="text-gray-700 mb-6">
              {location.description}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <Clock size={20} className="text-gray-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Price per hour</div>
                  <div className="font-medium">${location.pricePerHour}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Users size={20} className="text-gray-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Capacity</div>
                  <div className="font-medium">Up to {location.maxCapacity} people</div>
                </div>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="text-sm text-gray-500">Size</div>
                  <div className="font-medium">{location.size}</div>
                </div>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="text-sm text-gray-500">Instant Booking</div>
                  <div className="font-medium">Available</div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-4">Amenities</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {location.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center">
                  <Check size={18} className="text-orange-500 mr-2" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Card className="p-6 mb-8 relative z-10">
            <h3 className="text-xl font-semibold mb-4">Location</h3>
            <div className="h-[400px] relative z-0">
              <LeafletMap 
                center={[location.coordinates.lat, location.coordinates.lng]}
                className="w-full h-full rounded-lg"
              />
            </div>
            <p className="text-gray-700 mt-4">{location.address}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Reviews</h3>
            <div className="flex items-center mb-6">
              <div className="flex items-center mr-4">
                <Star size={24} className="text-yellow-500 mr-1" />
                <span className="text-2xl font-bold">{location.rating}</span>
              </div>
              <div className="text-gray-500">
                Based on {location.reviews} reviews
              </div>
            </div>
            <div className="space-y-6">
              <div className="border-b pb-6">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold mr-3">
                    M
                  </div>
                  <div>
                    <div className="font-medium">Michael Johnson</div>
                    <div className="text-gray-500 text-sm">April 2025</div>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={16} 
                      className={`${star <= 5 ? 'text-yellow-500' : 'text-gray-300'} mr-1`}
                      fill={star <= 5 ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <p className="text-gray-700">
                  Absolutely perfect space for our product launch. Great lighting and the host was very accommodating.
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="p-6 mb-6 relative z-20">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-orange-500">${location.pricePerHour}</span>
                <span className="text-gray-500">per hour</span>
              </div>
              
              {showBookingForm ? (
                <>
                  <BookingCalendar
                    onSelectDate={handleSelectDate}
                    onSelectTime={handleSelectTime}
                    onSelectHours={handleSelectHours}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    selectedHours={selectedHours}
                    pricePerHour={location.pricePerHour}
                  />
                  
                  {selectedDate && selectedTime && selectedHours && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex justify-between mb-2">
                        <span>Duration</span>
                        <span>{selectedHours} hours</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Price per hour</span>
                        <span>${location.pricePerHour}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200 mt-2">
                        <span>Total</span>
                        <span>${calculateTotal()}</span>
                      </div>
                      
                      <Button 
                        onClick={handleBook}
                        fullWidth
                        className="mt-4"
                      >
                        Continue to Payment
                      </Button>
                      <Button 
                        variant="outline"
                        fullWidth
                        className="mt-2"
                        onClick={toggleBookingForm}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Button 
                  onClick={handleStartBooking}
                  fullWidth
                >
                  Check Availability
                </Button>
              )}
            </Card>
            
            <div className="bg-gray-50 rounded-lg p-4 relative z-20">
              <h4 className="font-medium mb-2">Have a question?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Reach out to the host for more information about this space.
              </p>
              <Button 
                variant="outline" 
                fullWidth
                className="flex items-center justify-center"
                onClick={handleContactHost}
              >
                <MessageCircle size={16} className="mr-2" />
                Contact Host
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showPaymentForm && booking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative z-50">
            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-2">
                {['credit_card', 'bank_transfer', 'pse', 'nequi'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setSelectedPaymentMethod(method)}
                    className={`p-3 rounded-lg border text-center ${
                      selectedPaymentMethod === method
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {method.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <PaymentForm
              paymentMethod={selectedPaymentMethod}
              onSubmit={handlePaymentSubmit}
              onCancel={handlePaymentCancel}
              amount={booking.totalPrice}
            />
          </div>
        </div>
      )}

      {showPaymentConfirmation && booking && (
        <div className="fixed inset-0 z-50">
          <PaymentConfirmation
            booking={booking}
            location={location}
          />
        </div>
      )}

      {showChatDialog && (
        <div className="fixed inset-0 z-50">
          <ChatDialog
            host={location.host}
            spaceId={location.id}
            onClose={() => setShowChatDialog(false)}
          />
        </div>
      )}
    </div>
  );
};

export default LocationDetail;