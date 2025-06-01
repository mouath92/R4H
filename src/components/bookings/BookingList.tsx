import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Check, AlertCircle, X, Clock3 } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import CancellationDialog from './CancellationDialog';
import CancellationSuccess from './CancellationSuccess';
import ChatDialog from '../messaging/ChatDialog';
import { Booking } from '../../types';

interface BookingListProps {
  bookings: Booking[];
  onCancelBooking?: (bookingId: string, reason: string) => Promise<void>;
}

const BookingList: React.FC<BookingListProps> = ({ bookings, onCancelBooking }) => {
  const navigate = useNavigate();
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [showCancellationSuccess, setShowCancellationSuccess] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedHost, setSelectedHost] = useState<any>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success\" className="flex items-center"><Check size={12} className="mr-1" /> Confirmed</Badge>;
      case 'pending':
        return <Badge variant="warning" className="flex items-center"><Clock3 size={12} className="mr-1" /> Pending Host Confirmation</Badge>;
      case 'rejected':
        return <Badge variant="error" className="flex items-center"><X size={12} className="mr-1" /> Rejected by Host</Badge>;
      case 'cancelled':
        return <Badge variant="error" className="flex items-center"><X size={12} className="mr-1" /> Cancelled</Badge>;
      case 'completed':
        return <Badge variant="default" className="flex items-center"><Check size={12} className="mr-1" /> Completed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success" className="flex items-center"><Check size={12} className="mr-1" /> Paid</Badge>;
      case 'pending':
        return <Badge variant="warning" className="flex items-center"><Clock size={12} className="mr-1" /> Pending</Badge>;
      case 'failed':
        return <Badge variant="error" className="flex items-center"><X size={12} className="mr-1" /> Failed</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCancelBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setShowCancellationDialog(true);
  };

  const handleConfirmCancellation = async (reason: string) => {
    if (!selectedBookingId || !onCancelBooking) return;

    try {
      setCancelling(true);
      setError(null);
      await onCancelBooking(selectedBookingId, reason);
      setShowCancellationDialog(false);
      setShowCancellationSuccess(true);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleCloseCancellationSuccess = () => {
    setShowCancellationSuccess(false);
    window.location.reload();
  };

  const handleContactHost = (booking: Booking) => {
    if (!booking.location?.host) {
      console.error('Host information not available');
      return;
    }

    // Ensure we have all required host information
    const host = {
      id: booking.location.host.id,
      name: booking.location.host.name,
      email: booking.location.host.email,
      role: 'host'
    };

    setSelectedHost(host);
    setSelectedSpaceId(booking.locationId);
    setShowChatDialog(true);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-4">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-10">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No bookings found</h3>
          <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
          <Button onClick={() => navigate('/')}>
            Find Spaces
          </Button>
        </div>
      ) : (
        bookings.map((booking) => (
          <Card key={booking.id}>
            <div className="flex flex-col md:flex-row">
              <div 
                className="w-full md:w-1/4 h-48 md:h-auto bg-cover bg-center"
                style={{ backgroundImage: `url(${booking.location.images[0]})` }}
              ></div>
              <CardContent className="flex-grow p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <div className="flex gap-2 mb-2">
                      {getStatusBadge(booking.status)}
                      {getPaymentStatusBadge(booking.paymentStatus)}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{booking.location.title}</h3>
                    <div className="flex items-start text-gray-600 mb-4">
                      <MapPin size={18} className="mr-1 mt-0.5 flex-shrink-0" />
                      <span>{booking.location.address}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Payment Method: {booking.paymentMethod.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:text-right">
                    <div className="font-medium">{formatDate(booking.date)}</div>
                    <div className="text-gray-600">{booking.startTime} - {booking.endTime}</div>
                    <div className="text-gray-600">Duration: {booking.hours} hours</div>
                    <div className="mt-2 text-xl font-semibold text-orange-500">${booking.totalPrice}</div>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/locations/${booking.locationId}`)}
                  >
                    View Location
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => handleContactHost(booking)}
                    >
                      Contact Host
                    </Button>
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <Button 
                        variant="outline"
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancelling}
                        className="text-red-600 hover:bg-red-50"
                      >
                        {cancelling && selectedBookingId === booking.id ? 'Cancelling...' : 'Cancel'}
                      </Button>
                    )}
                  </div>
                </div>

                {booking.status === 'rejected' && booking.hostNotes && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Host Message: </span>
                      {booking.hostNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        ))
      )}

      {showCancellationDialog && (
        <CancellationDialog
          onConfirm={handleConfirmCancellation}
          onClose={() => setShowCancellationDialog(false)}
        />
      )}

      {showCancellationSuccess && (
        <CancellationSuccess
          onClose={handleCloseCancellationSuccess}
        />
      )}

      {showChatDialog && selectedHost && (
        <ChatDialog
          host={selectedHost}
          spaceId={selectedSpaceId}
          onClose={() => setShowChatDialog(false)}
        />
      )}
    </div>
  );
};

export default BookingList;