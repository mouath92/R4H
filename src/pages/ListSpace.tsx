import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { Building2, MapPin, DollarSign } from 'lucide-react';

interface SpaceFormData {
  title: string;
  description: string;
  address: string;
  pricePerHour: string;
  sizeM2: string;
  amenities: string[];
  images: File[];
  imageUrls: string[];
}

const ListSpace: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SpaceFormData>({
    title: '',
    description: '',
    address: '',
    pricePerHour: '',
    sizeM2: '',
    amenities: [],
    images: [],
    imageUrls: []
  });

  const amenitiesOptions = [
    'WiFi', 'Kitchen', 'Parking', 'Sound System', 'Projector',
    'Tables/Chairs', 'Storage', 'Air Conditioning', 'Security System',
    'Restrooms', 'Cleaning Service', 'Reception Area'
  ];

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, images: files }));

    // Create preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, imageUrls: previewUrls }));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('space-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('space-images')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('Please sign in to list your space');
      navigate('/login?redirect=/list-space');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload images to Supabase Storage
      const imageUrls = await uploadImages(formData.images);

      // Create space in database with proper host relationship
      const { data, error } = await supabase
        .from('spaces')
        .insert({
          title: formData.title,
          description: formData.description,
          address: formData.address,
          price_per_hour: parseFloat(formData.pricePerHour),
          size_m2: parseFloat(formData.sizeM2),
          amenities: formData.amenities,
          image_urls: imageUrls,
          status: 'pending',
          host_id: user.id, // Use the authenticated user's ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setShowSuccess(true);
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/host/listings');
      }, 2000);

    } catch (error) {
      console.error('Error creating space:', error);
      setError(error instanceof Error ? error.message : 'Failed to create space listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">List Your Space</h1>
      
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Space Listed Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Your space has been submitted for review. We'll notify you once it's approved.
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
              Photos
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <div className="text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="photos"
                />
                <label htmlFor="photos" className="cursor-pointer">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Drag and drop your photos here, or click to select files
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                  >
                    Select Files
                  </Button>
                </label>
              </div>

              {formData.imageUrls.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...formData.images];
                          const newUrls = [...formData.imageUrls];
                          newImages.splice(index, 1);
                          newUrls.splice(index, 1);
                          setFormData(prev => ({
                            ...prev,
                            images: newImages,
                            imageUrls: newUrls
                          }));
                        }}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || formData.images.length === 0}
            >
              {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ListSpace;