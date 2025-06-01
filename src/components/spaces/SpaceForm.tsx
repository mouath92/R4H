import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ImageUploader from '../ui/ImageUploader';
import { MapPin, DollarSign, Ruler } from 'lucide-react';

interface SpaceFormData {
  address: string;
  pricePerHour: string;
  sizeM2: string;
  imageUrl: string;
}

const SpaceForm: React.FC = () => {
  const [formData, setFormData] = useState<SpaceFormData>({
    address: '',
    pricePerHour: '',
    sizeM2: '',
    imageUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  const resetForm = () => {
    setFormData({
      address: '',
      pricePerHour: '',
      sizeM2: '',
      imageUrl: '',
    });
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const { data, error } = await supabase
        .from('spaces')
        .insert([
          {
            address: formData.address,
            price_per_hour: parseFloat(formData.pricePerHour),
            size_m2: parseFloat(formData.sizeM2),
            image_urls: [formData.imageUrl],
            title: `Space at ${formData.address}`, // Default title
            description: `${formData.sizeM2}m² space available for rent`, // Default description
            host_id: '00000000-0000-0000-0000-000000000000', // Replace with actual host ID
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Space listed successfully!',
      });
      resetForm();
    } catch (error) {
      console.error('Error creating space:', error);
      setMessage({
        type: 'error',
        text: 'Failed to create space listing. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <Input
        label="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        leftIcon={<MapPin size={18} className="text-gray-400" />}
        required
      />

      <Input
        label="Price per Hour"
        type="number"
        value={formData.pricePerHour}
        onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
        leftIcon={<DollarSign size={18} className="text-gray-400" />}
        required
      />

      <Input
        label="Size (m²)"
        type="number"
        value={formData.sizeM2}
        onChange={(e) => setFormData({ ...formData, sizeM2: e.target.value })}
        leftIcon={<Ruler size={18} className="text-gray-400" />}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Space Image
        </label>
        <ImageUploader onImageUploaded={handleImageUploaded} />
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !formData.imageUrl}
        >
          {isSubmitting ? 'Creating...' : 'Create Listing'}
        </Button>
      </div>
    </form>
  );
};

export default SpaceForm;