import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { User, Mail, Phone, Key, LogOut, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      getProfile();
    }
  }, [user]);

  const getProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (profile?.avatar_url) {
        const { data: { publicUrl } } = supabase
          .storage
          .from('profile-pictures')
          .getPublicUrl(profile.avatar_url);
        setAvatarUrl(publicUrl);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setUploadError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: filePath })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phoneNumber || '');
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleListSpace = () => {
    navigate('/list-space');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('profile.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* ...left side stays the same as your code... */}
        </div>
        <div className="md:col-span-1">
          <Card className="p-6 text-center">
            {/* Avatar upload area */}
            <div className="relative mb-4 flex flex-col items-center">
              <label
                htmlFor="avatar-upload"
                className="w-24 h-24 mx-auto relative cursor-pointer group"
                title="Edit Picture"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={28} className="text-white mb-1" />
                  <span className="text-white text-xs">Edit Picture</span>
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={uploadAvatar}
                  disabled={uploading}
                />
              </label>
              {uploading && (
                <p className="text-sm text-gray-500 mt-2">Uploading...</p>
              )}
              {uploadError && (
                <p className="text-sm text-red-500 mt-2">{uploadError}</p>
              )}
            </div>
            <h2 className="text-xl font-semibold">{user?.name || 'Guest'}</h2>
            <p className="text-gray-500 mb-4">{user?.email || 'No email set'}</p>
            <Button
              variant="outline"
              fullWidth
              className="flex items-center justify-center text-red-600 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut size={16} className="mr-2" />
              {t('auth.signOut')}
            </Button>
          </Card>
          {/* ...rest stays the same as your code... */}
        </div>
      </div>
    </div>
  );
};

export default Profile;
