import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { User, Mail, Phone, LogOut, Lock, Camera, AlertCircle, AlertTriangle, Building2, MapPin } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}
const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    try {
      await onSubmit(currentPassword, newPassword);
      onClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4">Change Password</h3>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input type="password" label="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required fullWidth />
            <Input type="password" label="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required fullWidth />
            <Input type="password" label="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required fullWidth />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Changing Password...' : 'Change Password'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}
const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  const [confirmText, setConfirmText] = useState('');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle size={24} className="text-red-500 mr-2" />
          <h3 className="text-xl font-semibold">Delete Account</h3>
        </div>
        <div className="mb-6">
          <p className="text-gray-600 mb-4">This action will permanently delete your account and all associated data, including:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
            <li>Your profile information</li>
            <li>All your bookings</li>
            <li>All your messages</li>
            <li>All your listed spaces (if you're a host)</li>
          </ul>
          <p className="text-red-600 text-sm font-medium">This action cannot be undone.</p>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type "delete my account" to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="delete my account"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={onConfirm}
            disabled={confirmText !== 'delete my account' || isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface HostApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HostApplicationData) => Promise<void>;
  isLoading: boolean;
}
interface HostApplicationData {
  business_name: string;
  business_type: string;
  experience: string;
  space_type: string;
  space_location: string;
  availability: string;
  additional_info: string;
}
const HostApplicationModal: React.FC<HostApplicationModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<HostApplicationData>({
    business_name: '',
    business_type: '',
    experience: '',
    space_type: '',
    space_location: '',
    availability: '',
    additional_info: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Host Application</h3>
        <p className="text-gray-600 mb-6">
          Please provide the following information to apply as a host. Our team will review your application and get back to you within 2-3 business days.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Business Name" value={formData.business_name} onChange={e => setFormData({ ...formData, business_name: e.target.value })} leftIcon={<Building2 size={18} className="text-gray-400" />} required fullWidth />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type of Business</label>
            <select value={formData.business_type} onChange={e => setFormData({ ...formData, business_type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" required>
              <option value="">Select business type</option>
              <option value="individual">Individual</option>
              <option value="company">Registered Company</option>
              <option value="partnership">Partnership</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience in Space Rental</label>
            <textarea value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" rows={3} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type of Space</label>
            <select value={formData.space_type} onChange={e => setFormData({ ...formData, space_type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" required>
              <option value="">Select space type</option>
              <option value="office">Office Space</option>
              <option value="event">Event Venue</option>
              <option value="studio">Studio</option>
              <option value="retail">Retail Space</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Input label="Space Location" value={formData.space_location} onChange={e => setFormData({ ...formData, space_location: e.target.value })} leftIcon={<MapPin size={18} className="text-gray-400" />} required fullWidth />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Space Availability</label>
            <select value={formData.availability} onChange={e => setFormData({ ...formData, availability: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" required>
              <option value="">Select availability</option>
              <option value="weekdays">Weekdays Only</option>
              <option value="weekends">Weekends Only</option>
              <option value="all">All Week</option>
              <option value="custom">Custom Schedule</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
            <textarea value={formData.additional_info} onChange={e => setFormData({ ...formData, additional_info: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" rows={4} />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit Application'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Profile component
const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHostApplicationModal, setShowHostApplicationModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || ''
  });

  // Avatar upload state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phoneNumber || ''
    });
    // Fetch avatar
    const fetchAvatar = async () => {
      if (!user?.id) return;
      const { data: profile } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
      if (profile?.avatar_url) {
        const { data: { publicUrl } } = supabase
          .storage
          .from('profile-pictures')
          .getPublicUrl(profile.avatar_url);
        setAvatarUrl(publicUrl);
      }
    };
    fetchAvatar();
  }, [user]);

  // Handle avatar upload
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
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);
      await supabase
        .from('users')
        .update({ avatar_url: filePath })
        .eq('id', user?.id);
      setAvatarUrl(publicUrl);
    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- Existing Profile actions below ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone_number: formData.phone,
          updated_at: new Date().toISOString() 
        })
        .eq('id', user?.id);
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsEditing(false);
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phoneNumber || ''
    });
    setIsEditing(false);
    setError(null);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    setDeleting(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase.from('users').delete().eq('id', user.id);
      if (deleteError) throw deleteError;
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      if (authError) throw authError;
      await logout();
      navigate('/login');
    } catch (error: any) {
      setError('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  const handleHostApplication = async (applicationData: HostApplicationData) => {
    setSubmittingApplication(true);
    try {
      const { error } = await supabase
        .from('host_applications')
        .insert([
          {
            user_id: user?.id,
            ...applicationData,
            status: 'pending',
            submitted_at: new Date().toISOString()
          }
        ]);
      if (error) throw error;
      setShowHostApplicationModal(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to submit application');
    } finally {
      setSubmittingApplication(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT SECTION */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-md flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm">Profile updated successfully!</p>
              </div>
            )}
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  <Input label="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} leftIcon={<User size={18} className="text-gray-400" />} fullWidth required />
                  <Input label="Email Address" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} leftIcon={<Mail size={18} className="text-gray-400" />} fullWidth disabled />
                  <Input label="Phone Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} leftIcon={<Phone size={18} className="text-gray-400" />} fullWidth />
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <Button variant="outline" type="button" onClick={handleCancel} disabled={saving}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center">
                  <User size={20} className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Full Name</div>
                    <div className="mt-1">{user?.name || 'Not set'}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail size={20} className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Email Address</div>
                    <div className="mt-1">{user?.email || 'Not set'}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone size={20} className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Phone Number</div>
                    <div className="mt-1">{user?.phoneNumber || 'Not set'}</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-6">Password & Security</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Lock size={20} className="text-gray-400 mr-3" />
                <div>
                  <div className="font-medium">Password</div>
                  <div className="text-sm text-gray-500">Update your password regularly to keep your account secure</div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                Change Password
              </Button>
            </div>
          </Card>
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
            <p className="text-gray-600 mb-4">Once you delete your account, all your data will be permanently removed. This action cannot be undone.</p>
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => setShowDeleteModal(true)}>
              Delete Account
            </Button>
          </Card>
        </div>

        {/* RIGHT: Avatar and actions */}
        <div className="md:col-span-1">
          <Card className="p-6 text-center">
            <div className="mb-4 flex flex-col items-center">
              <label htmlFor="avatar-upload" className="w-24 h-24 mx-auto relative cursor-pointer group" title="Edit Picture">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={28} className="text-white mb-1" />
                  <span className="text-white text-xs">Edit Picture</span>
                </div>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={uploading} />
              </label>
              {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
              {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}
            </div>
            <h2 className="text-xl font-semibold">{user?.name || 'Guest'}</h2>
            <p className="text-gray-500 mb-4">{user?.email || 'No email set'}</p>
            <Button variant="outline" fullWidth className="flex items-center justify-center text-red-600 hover:bg-red-50" onClick={handleSignOut}>
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </Card>
          {!user?.role || user.role === 'user' ? (
            <Card className="p-6 mt-6 bg-orange-50 border border-orange-100">
              <h3 className="font-semibold mb-3">Become a Host</h3>
              <p className="text-sm text-gray-600 mb-4">
                Share your space and start earning. Apply now to become a host.
              </p>
              <Button fullWidth onClick={() => setShowHostApplicationModal(true)} disabled={submittingApplication}>
                {submittingApplication ? 'Processing...' : 'Apply to Host'}
              </Button>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} onSubmit={async (_, np) => {
        setChangingPassword(true);
        try {
          const { error } = await supabase.auth.updateUser({ password: np });
          if (error) throw error;
          setShowPasswordModal(false);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        } catch (error: any) {
          setError(error.message || 'Failed to change password');
        } finally {
          setChangingPassword(false);
        }
      }} isLoading={changingPassword} />

      <DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDeleteAccount} isDeleting={deleting} />

      <HostApplicationModal isOpen={showHostApplicationModal} onClose={() => setShowHostApplicationModal(false)} onSubmit={handleHostApplication} isLoading={submittingApplication} />
    </div>
  );
};

export default Profile;
