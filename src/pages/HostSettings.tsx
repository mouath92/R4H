import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Bell, DollarSign, Shield, User, Mail, Phone, Building2 } from 'lucide-react';

const HostSettings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    businessName: '',
    taxId: '',
    phoneNumber: '',
    address: '',
    notificationsEnabled: true,
    instantBookingEnabled: false,
    minimumNotice: '24',
    cancellationPolicy: 'flexible'
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Update user profile in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          business_name: profile.businessName,
          tax_id: profile.taxId,
          phone_number: profile.phoneNumber,
          address: profile.address,
          host_settings: {
            notifications_enabled: profile.notificationsEnabled,
            instant_booking_enabled: profile.instantBookingEnabled,
            minimum_notice: profile.minimumNotice,
            cancellation_policy: profile.cancellationPolicy
          }
        })
        .eq('id', user?.id);

      if (error) throw error;

      setSuccess('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Host Settings</h1>

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Business Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Business Name"
              value={profile.businessName}
              onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
              leftIcon={<Building2 size={18} className="text-gray-400" />}
            />
            <Input
              label="Tax ID / Business Registration"
              value={profile.taxId}
              onChange={(e) => setProfile({ ...profile, taxId: e.target.value })}
              leftIcon={<DollarSign size={18} className="text-gray-400" />}
            />
            <Input
              label="Phone Number"
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
              leftIcon={<Phone size={18} className="text-gray-400" />}
            />
            <Input
              label="Business Address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              leftIcon={<Building2 size={18} className="text-gray-400" />}
            />
          </div>
        </Card>

        {/* Booking Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Booking Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Instant Booking</h3>
                <p className="text-sm text-gray-600">Allow guests to book instantly without approval</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={profile.instantBookingEnabled}
                  onChange={(e) => setProfile({ ...profile, instantBookingEnabled: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Notice Period
              </label>
              <select
                value={profile.minimumNotice}
                onChange={(e) => setProfile({ ...profile, minimumNotice: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="0">No minimum notice</option>
                <option value="1">1 hour</option>
                <option value="3">3 hours</option>
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cancellation Policy
              </label>
              <select
                value={profile.cancellationPolicy}
                onChange={(e) => setProfile({ ...profile, cancellationPolicy: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="flexible">Flexible (Full refund 24h prior)</option>
                <option value="moderate">Moderate (Full refund 5 days prior)</option>
                <option value="strict">Strict (50% refund up until 1 week prior)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive booking requests and updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={profile.notificationsEnabled}
                  onChange={(e) => setProfile({ ...profile, notificationsEnabled: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HostSettings;