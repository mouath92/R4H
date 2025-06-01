import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import BookingList from '../components/bookings/BookingList';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Booking } from '../types';
import { Loader } from 'lucide-react';

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoading) return; // wait until auth is fully resolved
  
    if (!user || !isAuthenticated) {
      console.warn("User not authenticated. Redirecting to login...");
      navigate('/login');
      return;
    }
  
    fetchBookings();
  }, [user, isAuthenticated, isLoading]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          space:space_id (
            title,
            address,
            image_urls,
            host_id,
            host:users!spaces_host_id_fkey (
              name,
              email
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedBookings = data.map(booking => ({
        id: booking.id,
        locationId: booking.space_id,
        userId: booking.user_id,
        date: booking.date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        status: booking.status,
        totalPrice: booking.total_price,
        hours: booking.duration_hours,
        paymentMethod: booking.payment_method,
        paymentStatus: booking.payment_status,
        hostNotes: booking.host_notes,
        location: {
          id: booking.space_id,
          title: booking.space.title,
          address: booking.space.address,
          images: booking.space.image_urls,
          host: booking.space.host
        }
      }));

      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          host_confirmation_status: 'cancelled',
          host_notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .eq('user_id', user?.id);
  
      if (error) throw error;
  
      // Update local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? {
                ...booking,
                status: 'cancelled',
                host_confirmation_status: 'cancelled',
                hostNotes: reason
              }
            : booking
        )
      );
    } catch (err) {
      console.error('Cancel booking error:', err);
      throw new Error('Failed to cancel booking. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const upcomingBookings = bookings.filter(booking => 
    booking.status === 'confirmed' || booking.status === 'pending'
  );
  
  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || booking.status === 'cancelled'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bookings</h1>
      
      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">
            Upcoming
            {upcomingBookings.length > 0 && (
              <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs">
                {upcomingBookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <BookingList 
            bookings={upcomingBookings} 
            onCancelBooking={handleCancelBooking}
          />
        </TabsContent>
        
        <TabsContent value="past">
          <BookingList bookings={pastBookings} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Bookings