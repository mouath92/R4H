import React, { useState } from 'react';
import { CreditCard, Building2, Wallet } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface PaymentFormProps {
  paymentMethod: string;
  onSubmit: (paymentDetails: any) => void;
  onCancel: () => void;
  amount: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentMethod,
  onSubmit,
  onCancel,
  amount,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({
    expiryDate: '',
    cvv: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate expiry date
    const expiryError = validateExpiryDate(expiryDate);
    const cvvError = validateCVV(cvv);

    if (expiryError || cvvError) {
      setErrors({
        expiryDate: expiryError || '',
        cvv: cvvError || ''
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const paymentDetails = {
        paymentMethod,
        amount,
        ...(paymentMethod === 'credit_card' && {
          cardNumber,
          expiryDate,
          cvv,
          name,
        }),
        ...(paymentMethod === 'bank_transfer' && {
          bankAccount,
          bankName,
          documentNumber,
        }),
        ...(paymentMethod === 'nequi' && {
          phoneNumber,
          documentNumber,
        }),
        ...(paymentMethod === 'pse' && {
          bankName,
          documentNumber,
        }),
      };

      await onSubmit(paymentDetails);
    } catch (error) {
      console.error('Payment submission error:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Payment failed. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Format as MM/YY
    if (value.length >= 2) {
      const month = parseInt(value.slice(0, 2));
      if (month > 12) {
        value = '12' + value.slice(2);
      }
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    
    setExpiryDate(value);
    setErrors(prev => ({ ...prev, expiryDate: '' }));
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvv(value);
    setErrors(prev => ({ ...prev, cvv: '' }));
  };

  const validateExpiryDate = (value: string): string | null => {
    if (!value) return 'Expiry date is required';
    
    const [month, year] = value.split('/');
    if (!month || !year || month.length !== 2 || year.length !== 2) {
      return 'Invalid expiry date format';
    }

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const expMonth = parseInt(month);
    const expYear = parseInt(year);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return 'Card has expired';
    }

    if (expMonth < 1 || expMonth > 12) {
      return 'Invalid month';
    }

    return null;
  };

  const validateCVV = (value: string): string | null => {
    if (!value) return 'CVV is required';
    if (!/^\d{3,4}$/.test(value)) {
      return 'CVV must be 3 or 4 digits';
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Total Amount</span>
          <span className="text-xl font-bold text-orange-500">${amount}</span>
        </div>
        <p className="text-sm text-gray-600">
          Your payment will be processed securely through our payment gateway.
        </p>
      </div>

      {paymentMethod === 'credit_card' && (
        <>
          <Input
            label="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            placeholder="1234 5678 9012 3456"
            leftIcon={<CreditCard size={18} className="text-gray-400" />}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Expiry Date"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                placeholder="MM/YY"
                maxLength={5}
                error={errors.expiryDate}
                className="w-full text-gray-700 bg-white border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
              {errors.expiryDate && (
                <p className="mt-1 text-xs text-red-500">{errors.expiryDate}</p>
              )}
            </div>
            <div>
              <Input
                label="CVV"
                value={cvv}
                onChange={handleCVVChange}
                type="text"
                maxLength={4}
                placeholder="123"
                error={errors.cvv}
                className="w-full text-gray-700 bg-white border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
              {errors.cvv && (
                <p className="mt-1 text-xs text-red-500">{errors.cvv}</p>
              )}
            </div>
          </div>
          <Input
            label="Cardholder Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </>
      )}

      {paymentMethod === 'bank_transfer' && (
        <>
          <Input
            label="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Enter your bank name"
            leftIcon={<Building2 size={18} className="text-gray-400" />}
            required
          />
          <Input
            label="Account Number"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="Enter your account number"
            required
          />
          <Input
            label="Document Number"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder="Enter your document number"
            required
          />
        </>
      )}

      {paymentMethod === 'nequi' && (
        <>
          <Input
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your Nequi phone number"
            leftIcon={<Wallet size={18} className="text-gray-400" />}
            required
          />
          <Input
            label="Document Number"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder="Enter your document number"
            required
          />
        </>
      )}

      {paymentMethod === 'pse' && (
        <>
          <Input
            label="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Select your bank"
            leftIcon={<Building2 size={18} className="text-gray-400" />}
            required
          />
          <Input
            label="Document Number"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder="Enter your document number"
            required
          />
        </>
      )}

      {errors.submit && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {errors.submit}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <Button
          type="submit"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : `Pay $${amount}`}
        </Button>
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;