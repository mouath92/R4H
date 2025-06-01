import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, Lock, User } from 'lucide-react';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') as 'user' | 'host' || 'user';

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((time) => Math.max(0, time - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
  
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      setError('');
      setSuccess('');
      setLoading(true);
  
      await register(name, email, password, role);
      navigate('/'); // ✅ Redirect to home after successful signup
  
    } catch (err: any) {
      if (err?.message?.includes('over_email_send_rate_limit')) {
        setCooldown(21);
        setError('Please wait before trying again');
      } else {
        setError(err?.message || 'Failed to create an account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join R4H as a {role === 'host' ? 'host' : 'customer'}
          </p>
        </div>

        <div className="bg-white p-8 shadow rounded-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">
              {error}
              {cooldown > 0 && (
                <span className="block mt-1">
                  You can try again in {cooldown} seconds
                </span>
              )}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md text-sm">
              {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                id="name"
                name="name"
                type="text"
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User size={18} className="text-gray-400" />}
                required
                fullWidth
              />
            </div>

            <div>
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={18} className="text-gray-400" />}
                required
                fullWidth
              />
            </div>

            <div>
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={18} className="text-gray-400" />}
                helperText="Password must be at least 8 characters"
                required
                fullWidth
              />
            </div>

            <div>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock size={18} className="text-gray-400" />}
                required
                fullWidth
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-orange-500 hover:text-orange-600">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-orange-500 hover:text-orange-600">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={loading || cooldown > 0}
            >
              {loading
                ? 'Creating account...'
                : cooldown > 0
                ? `Try again in ${cooldown}s`
                : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account?</span>
            <Link
              to={`/login${role === 'host' ? '?role=host' : ''}`}
              className="ml-1 text-orange-500 hover:text-orange-600 font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
