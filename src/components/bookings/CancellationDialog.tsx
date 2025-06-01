import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';

interface CancellationDialogProps {
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

const CancellationDialog: React.FC<CancellationDialogProps> = ({ onConfirm, onClose }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const cancellationReasons = [
    'Schedule conflict',
    'Change of plans',
    'Found a different location',
    'Emergency situation',
    'Weather concerns',
    'Budget constraints',
    'Other'
  ];

  const handleConfirm = () => {
    const reason = selectedReason === 'Other' ? otherReason : selectedReason;
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Cancel Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Please select a reason for cancellation. This helps us improve our service.
          </p>

          <div className="space-y-3">
            {cancellationReasons.map((reason) => (
              <label
                key={reason}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedReason === reason
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="cancellation-reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="hidden"
                />
                <span className={selectedReason === reason ? 'text-orange-700' : 'text-gray-700'}>
                  {reason}
                </span>
              </label>
            ))}
          </div>

          {selectedReason === 'Other' && (
            <textarea
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              placeholder="Please specify your reason..."
              className="mt-4 w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
            />
          )}

          <div className="mt-6 flex gap-3">
            <Button
              onClick={handleConfirm}
              disabled={!selectedReason || (selectedReason === 'Other' && !otherReason.trim())}
              fullWidth
            >
              Confirm Cancellation
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              fullWidth
            >
              Keep Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationDialog;