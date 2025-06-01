import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from '../ui/Button';

interface CancellationSuccessProps {
  onClose: () => void;
}

const CancellationSuccess: React.FC<CancellationSuccessProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleViewBookings = () => {
    onClose(); // Close the modal first
    navigate('/bookings'); // Navigate to bookings page
  };

  const handleBackToHome = () => {
    onClose(); // Close the modal first
    navigate('/'); // Navigate to home page
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Cancelled</h2>
          <p className="text-gray-600">
            Your booking has been successfully cancelled. The refund process will be initiated according to our cancellation policy.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            fullWidth
            onClick={handleViewBookings}
          >
            View My Bookings
          </Button>
          <Button 
            variant="outline" 
            fullWidth
            onClick={handleBackToHome}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CancellationSuccess;
