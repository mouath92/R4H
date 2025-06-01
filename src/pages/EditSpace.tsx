import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { Building2, MapPin, DollarSign } from 'lucide-react';
import ImageUploader from '../components/ui/ImageUploader';

const EditSpace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    pricePerHour: '',
    sizeM2: '',
    amenities: [] as string[],
    imageUrls: [] as string[]
  });

  const amenitiesOptions = [
    'WiFi', 'Kitchen', 'Parking', 'Sound System', 'Projector',
    'Tables/Chairs', 'Storage', 'Air Conditioning', 'Security System',
    'Restrooms', 'Cleaning Service', 'Reception Area'
  ];

  useEffect(() => {
    fetchSpaceDetails();
  }, [id]);

  const fetchSpaceDetails = async () => {
    try {
      if (!id) return;

      const { data: space, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        title: space.title,
        description: space.description,
        address: space.address,
        pricePerHour: space.price_per_hour.toString(),
        sizeM2: space.size_m2.toString(),
        amenities: space.amenities || [],
        imageUrls: space.image_urls || []
      });
    } catch (error) {
      console.error('Error fetching space:', error);
      setError('Failed to load space details');
    } finally {
      setLoading(false);
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, url]
    }));
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter(url => url !== urlToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('spaces')
        .update({
          title: formData.title,
          description: formData.description,
          address: formData.address,
          price_per_hour: parseFloat(formData.pricePerHour),
          size_m2: parseFloat(formData.sizeM2),
          amenities: formData.amenities,
          image_urls: formData.imageUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate('/host/listings');
      }, 2000);
    } catch (error) {
      console.error('Error updating space:', error);
      setError('Failed to update space');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Space</h1>

      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Space Updated Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Your changes have been saved.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to listings...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Space Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            leftIcon={<Building2 size={18} className="text-gray-400" />}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={4}
              required
            />
          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            leftIcon={<MapPin size={18} className="text-gray-400" />}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price per Hour ($)"
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenitiesOptions.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    formData.amenities.includes(amenity)
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Photos
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={url}
                    alt={`Space photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Photos
              </label>
              <ImageUploader onImageUploaded={handleImageUploaded} />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/host/listings')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditSpace;