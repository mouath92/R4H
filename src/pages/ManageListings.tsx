import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Eye, AlertCircle, Loader } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hasBookings: boolean;
  bookingsCount?: number;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  hasBookings,
  bookingsCount = 0
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center mb-4">
          <AlertCircle size={24} className="text-red-500 mr-2" />
          <h3 className="text-xl font-semibold">Delete Space</h3>
        </div>
        
        {hasBookings ? (
          <>
            <p className="text-gray-600 mb-4">
              This space has {bookingsCount} active booking{bookingsCount !== 1 ? 's' : ''}. Deleting this space will also delete all associated bookings.
            </p>
            <p className="text-red-600 text-sm mb-6">
              This action cannot be undone.
            </p>
          </>
        ) : (
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this space? This action cannot be undone.
          </p>
        )}
        
        <div className="flex justify-end space-x-3">
          <Button 
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={onConfirm}
          >
            Delete Space
          </Button>
        </div>
      </div>
    </div>
  );
};

const ManageListings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<{ id: string; bookingsCount: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSpaces();
    }
  }, [user]);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('host_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSpaces(data || []);
    } catch (error) {
      console.error('Error fetching spaces:', error);
      setError('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (spaceId: string) => {
    try {
      setDeleteError(null);

      // Check for existing bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('space_id', spaceId)
        .not('status', 'eq', 'cancelled');

      if (bookingsError) throw bookingsError;

      setSpaceToDelete({
        id: spaceId,
        bookingsCount: bookings?.length || 0
      });
      setShowDeleteConfirmation(true);
    } catch (error) {
      console.error('Error checking bookings:', error);
      setDeleteError({
        id: spaceId,
        message: 'Failed to check space bookings'
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!spaceToDelete) return;

    try {
      setDeleting(true);
      setDeleteError(null);

      // First, delete all conversations associated with the space
      // This will cascade delete conversation_participants and messages
      const { error: deleteConversationsError } = await supabase
        .from('conversations')
        .delete()
        .eq('space_id', spaceToDelete.id);

      if (deleteConversationsError) throw deleteConversationsError;

      // Then delete all bookings
      if (spaceToDelete.bookingsCount > 0) {
        const { error: deleteBookingsError } = await supabase
          .from('bookings')
          .delete()
          .eq('space_id', spaceToDelete.id);

        if (deleteBookingsError) throw deleteBookingsError;
      }

      // Finally delete the space
      const { error: deleteSpaceError } = await supabase
        .from('spaces')
        .delete()
        .eq('id', spaceToDelete.id)
        .eq('host_id', user?.id);

      if (deleteSpaceError) throw deleteSpaceError;

      // Update UI
      setSpaces(spaces.filter(space => space.id !== spaceToDelete.id));
      setShowDeleteConfirmation(false);
      setSpaceToDelete(null);
    } catch (error: any) {
      console.error('Error deleting space:', error);
      setDeleteError({
        id: spaceToDelete.id,
        message: error.message || 'Failed to delete space'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (spaceId: string) => {
    navigate(`/host/listings/${spaceId}/edit`);
  };

  const handleView = (spaceId: string) => {
    navigate(`/locations/${spaceId}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Listings</h1>
          <Button onClick={() => navigate('/list-space')}>
            Add New Listing
          </Button>
        </div>
        <div className="text-center py-12">
          <Loader size={40} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Listings</h1>
        <Button onClick={() => navigate('/list-space')}>
          Add New Listing
        </Button>
      </div>

      {error ? (
        <div className="text-center py-12">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchSpaces}>
            Try Again
          </Button>
        </div>
      ) : spaces.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <AlertCircle size={40} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Listings Yet</h3>
          <p className="text-gray-600 mb-6">Start earning by sharing your space.</p>
          <Button onClick={() => navigate('/list-space')}>
            Create Your First Listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <Card key={space.id} className="overflow-hidden">
              <div 
                className="h-48 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${
                    space.image_urls?.[0] || 
                    'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
                  })`
                }}
              />
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{space.title}</h3>
                    <p className="text-gray-600 text-sm">{space.address}</p>
                  </div>
                  <Badge 
                    variant={
                      space.status === 'active' ? 'success' : 
                      space.status === 'pending' ? 'warning' : 
                      'error'
                    }
                  >
                    {space.status.charAt(0).toUpperCase() + space.status.slice(1)}
                  </Badge>
                </div>

                {deleteError && deleteError.id === space.id && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 text-sm">{deleteError.message}</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Price per hour</p>
                    <p className="text-lg font-semibold text-orange-500">
                      ${space.price_per_hour}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleView(space.id)}
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(space.id)}
                    >
                      <Edit2 size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteClick(space.id)}
                      disabled={deleting && spaceToDelete?.id === space.id}
                    >
                      <Trash2 size={16} className="mr-1" />
                      {deleting && spaceToDelete?.id === space.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <DeleteConfirmation
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setSpaceToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        hasBookings={Boolean(spaceToDelete?.bookingsCount)}
        bookingsCount={spaceToDelete?.bookingsCount}
      />
    </div>
  );
};

export default ManageListings;