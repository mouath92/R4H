import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Home, 
  Star,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Loader,
  Check,
  X,
  Clock,
  ClipboardList,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface BookingsByStatus {
  active: any[];
  completed: any[];
  cancelled: any[];
  pending: any[];
}

const HostDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [bookingStats, setBookingStats] = useState({
    active: 0,
    completed: 0,
    cancelled: 0,
    pending: 0
  });
  const [bookingsByStatus, setBookingsByStatus] = useState<BookingsByStatus>({
    active: [],
    completed: [],
    cancelled: [],
    pending: []
  });
  const [expandedStatus, setExpandedStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPendingBookings();
      fetchBookingStats();
      fetchBookingsByStatus();
    }
  }, [user]);

  const fetchBookingsByStatus = async () => {
    try {
      const { data: spaces } = await supabase
        .from('spaces')
        .select('id')
        .eq('host_id', user?.id);

      if (!spaces || spaces.length === 0) return;

      const spaceIds = spaces.map(space => space.id);

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:user_id (
            name,
            email
          ),
          space:space_id (
            title,
            address,
            image_urls
          )
        `)
        .in('space_id', spaceIds)
        .order('date', { ascending: false });

      if (error) throw error;

      const grouped = bookings?.reduce((acc: BookingsByStatus, booking) => {
        if (booking.status === 'confirmed') acc.active.push(booking);
        else if (booking.status === 'completed') acc.completed.push(booking);
        else if (booking.status === 'cancelled') acc.cancelled.push(booking);
        else if (booking.status === 'pending') acc.pending.push(booking);
        return acc;
      }, { active: [], completed: [], cancelled: [], pending: [] });

      setBookingsByStatus(grouped);
    } catch (error) {
      console.error('Error fetching bookings by status:', error);
    }
  };

  const fetchBookingStats = async () => {
    try {
      const { data: spaces } = await supabase
        .from('spaces')
        .select('id')
        .eq('host_id', user?.id);

      if (!spaces || spaces.length === 0) return;

      const spaceIds = spaces.map(space => space.id);

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('status')
        .in('space_id', spaceIds);

      if (error) throw error;

      const stats = bookings?.reduce((acc: any, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {});

      setBookingStats({
        active: stats.confirmed || 0,
        completed: stats.completed || 0,
        cancelled: stats.cancelled || 0,
        pending: stats.pending || 0
      });
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    }
  };

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: spaces, error: spacesError } = await supabase
        .from('spaces')
        .select('id')
        .eq('host_id', user?.id);

      if (spacesError) throw spacesError;

      if (!spaces || spaces.length === 0) {
        setPendingBookings([]);
        setLoading(false);
        return;
      }

      const spaceIds = spaces.map(space => space.id);

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          user:user_id (
            name,
            email
          ),
          space:space_id (
            title,
            address,
            image_urls
          )
        `)
        .eq('host_confirmation_status', 'pending')
        .in('space_id', spaceIds)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      setPendingBookings(bookings || []);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      setError('Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, status: 'confirmed' | 'rejected', notes?: string) => {
    try {
      setProcessingBookingId(bookingId);

      const { error } = await supabase
        .from('bookings')
        .update({ 
          host_confirmation_status: status,
          host_confirmation_date: new Date().toISOString(),
          host_notes: notes,
          status: status
        })
        .eq('id', bookingId);

      if (error) throw error;

      setPendingBookings(prev => prev.filter(booking => booking.id !== bookingId));
      fetchBookingStats();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    } finally {
      setProcessingBookingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStatusClick = (status: string) => {
    setExpandedStatus(expandedStatus === status ? null : status);
  };

  const renderBookingList = (bookings: any[]) => {
    return (
      <div className="mt-4 space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{booking.space?.title}</h4>
                <p className="text-sm text-gray-600">{booking.space?.address}</p>
              </div>
              <Badge variant={
                booking.status === 'confirmed' ? 'success' :
                booking.status === 'completed' ? 'primary' :
                booking.status === 'cancelled' ? 'error' :
                'warning'
              }>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Guest</p>
                <p className="font-medium">{booking.user?.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{formatDate(booking.date)}</p>
              </div>
              <div>
                <p className="text-gray-500">Time</p>
                <p className="font-medium">{booking.start_time} - {booking.end_time}</p>
              </div>
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-medium">${booking.total_price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!user) {
    navigate('/login?role=host');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Host Dashboard</h1>
        <Button onClick={() => navigate('/list-space')}>
          Add New Listing
        </Button>
      </div>

      {/* Booking Status Overview */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Booking Status Overview</h2>
        <div className="space-y-4">
          <div 
            className="bg-green-50 p-4 rounded-lg cursor-pointer"
            onClick={() => handleStatusClick('active')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Check size={20} className="text-green-500 mr-2" />
                <div>
                  <span className="text-green-700 font-medium">Active Bookings</span>
                  <span className="ml-2 text-2xl font-bold text-green-700">{bookingStats.active}</span>
                </div>
              </div>
              {expandedStatus === 'active' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {expandedStatus === 'active' && renderBookingList(bookingsByStatus.active)}
          </div>

          <div 
            className="bg-blue-50 p-4 rounded-lg cursor-pointer"
            onClick={() => handleStatusClick('completed')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Check size={20} className="text-blue-500 mr-2" />
                <div>
                  <span className="text-blue-700 font-medium">Completed Bookings</span>
                  <span className="ml-2 text-2xl font-bold text-blue-700">{bookingStats.completed}</span>
                </div>
              </div>
              {expandedStatus === 'completed' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {expandedStatus === 'completed' && renderBookingList(bookingsByStatus.completed)}
          </div>

          <div 
            className="bg-red-50 p-4 rounded-lg cursor-pointer"
            onClick={() => handleStatusClick('cancelled')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <X size={20} className="text-red-500 mr-2" />
                <div>
                  <span className="text-red-700 font-medium">Cancelled Bookings</span>
                  <span className="ml-2 text-2xl font-bold text-red-700">{bookingStats.cancelled}</span>
                </div>
              </div>
              {expandedStatus === 'cancelled' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {expandedStatus === 'cancelled' && renderBookingList(bookingsByStatus.cancelled)}
          </div>

          <div 
            className="bg-yellow-50 p-4 rounded-lg cursor-pointer"
            onClick={() => handleStatusClick('pending')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock size={20} className="text-yellow-500 mr-2" />
                <div>
                  <span className="text-yellow-700 font-medium">Pending Bookings</span>
                  <span className="ml-2 text-2xl font-bold text-yellow-700">{bookingStats.pending}</span>
                </div>
              </div>
              {expandedStatus === 'pending' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {expandedStatus === 'pending' && renderBookingList(bookingsByStatus.pending)}
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold">$1,234</h3>
              <p className="text-sm text-green-600 flex items-center mt-2">
                <ArrowUpRight size={16} className="mr-1" />
                +12.5% from last month
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
              <h3 className="text-2xl font-bold">48</h3>
              <p className="text-sm text-red-600 flex items-center mt-2">
                <ArrowDownRight size={16} className="mr-1" />
                -3.2% from last month
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Listings</p>
              <h3 className="text-2xl font-bold">12</h3>
              <p className="text-sm text-gray-600 mt-2">
                2 pending approval
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Home size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Rating</p>
              <h3 className="text-2xl font-bold">4.8</h3>
              <p className="text-sm text-gray-600 mt-2">
                From 156 reviews
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Star size={24} className="text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/host/listings')}
          >
            <Home size={18} className="mr-2" /> Manage Listings
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/messages')}
          >
            <Users size={18} className="mr-2" /> View Messages
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/host/settings')}
          >
            <Star size={18} className="mr-2" /> Host Settings
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/bookings')}
          >
            <ClipboardList size={18} className="mr-2" /> View All Bookings
          </Button>
        </div>
      </Card>

      {/* Pending Bookings Section */}
      <Card className="mt-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Pending Booking Requests</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <Loader size={32} className="animate-spin text-orange-500 mb-2 mx-auto" />
              <p className="text-gray-500">Loading booking requests...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => fetchPendingBookings()}
              >
                Try Again
              </Button>
            </div>
          ) : pendingBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={48} className="text-gray-400 mb-3 mx-auto" />
              <p className="text-gray-600">No pending booking requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">{booking.space?.title || 'Unnamed Space'}</h3>
                      <p className="text-gray-600 text-sm">{booking.space?.address || 'No address provided'}</p>
                    </div>
                    <Badge variant="warning" className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      Pending Confirmation
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Guest</p>
                      <p className="font-medium">{booking.user?.name || 'Unknown Guest'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(booking.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{booking.start_time} - {booking.end_time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium">${booking.total_price}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleBookingAction(booking.id, 'rejected', 'Booking rejected by host')}
                      disabled={processingBookingId === booking.id}
                    >
                      {processingBookingId === booking.id ? (
                        <Loader size={16} className="animate-spin mr-2" />
                      ) : (
                        <X size={16} className="mr-2" />
                      )}
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleBookingAction(booking.id, 'confirmed')}
                      disabled={processingBookingId === booking.id}
                    >
                      {processingBookingId === booking.id ? (
                        <Loader size={16} className="animate-spin mr-2" />
                      ) : (
                        <Check size={16} className="mr-2" />
                      )}
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default HostDashboard;