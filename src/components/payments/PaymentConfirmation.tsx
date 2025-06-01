import React, { useEffect } from 'react';
import { CheckCircle, Calendar, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { Location, Booking, Message } from '../../types';
import { messages } from '../../data/mockData';

interface PaymentConfirmationProps {
  booking: Booking;
  location: Location;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({ booking, location }) => {
  useEffect(() => {
    // Create and store confirmation message
    const confirmationMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: location.host.id,
      receiverId: '3', // Current user ID
      content: `
Booking Confirmation for ${location.title}

Dear Guest,

Your booking has been confirmed and payment received. Here are your booking details:

📅 Date: ${formatDate(booking.date)}
🕒 Time: ${booking.startTime} - ${booking.endTime}
⏱️ Duration: ${booking.hours} hours
📍 Location: ${location.address}

Total Amount Paid: $${booking.totalPrice}
Payment Method: ${booking.paymentMethod.replace('_', ' ').toUpperCase()}

Important Information:
- Please arrive 10 minutes before your scheduled time
- Bring a valid ID for check-in
- Contact the host if you need early access for setup

Amenities included:
${location.amenities.map(amenity => `- ${amenity}`).join('\n')}

If you have any questions or need to modify your booking, please don't hesitate to contact me.

Best regards,
${location.host.name}
      `,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Store the message in localStorage
    const existingMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    localStorage.setItem('messages', JSON.stringify([...existingMessages, confirmationMessage]));
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">
            Your payment has been processed successfully. A confirmation message has been sent to your inbox.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{location.title}</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-gray-600">{formatDate(booking.date)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-gray-600">{booking.startTime} - {booking.endTime}</p>
                  <p className="text-sm text-gray-500">Duration: {booking.hours} hours</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-gray-600">{location.address}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-semibold">${booking.totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-semibold">{booking.paymentMethod.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Link to="/messages">
            <Button fullWidth>
              View Confirmation Message
            </Button>
          </Link>
          <Link to="/bookings">
            <Button variant="outline" fullWidth>
              View My Bookings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;