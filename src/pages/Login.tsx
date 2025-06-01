import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') as 'user' | 'host' || 'user';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(role === 'host' ? '/host/dashboard' : '/profile');
    }
  }, [isAuthenticated, navigate, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password, role);
      navigate(role === 'host' ? '/host/dashboard' : '/profile');
    } catch (err: any) {
      if (err.message.includes('Email not confirmed')) {
        setError('Please check your email and confirm your account before logging in.');
      } else if (err.message.includes('host privileges')) {
        setError('This account does not have host privileges. Please log in as a regular user or register as a host.');
      } else {
        setError('Failed to log in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your {role === 'host' ? 'host' : 'customer'} account</p>
        </div>

        <div className="bg-white p-8 shadow rounded-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">{error}</div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input id="email" name="email" type="email" label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} leftIcon={<Mail size={18} className="text-gray-400" />} required fullWidth />
            <Input id="password" name="password" type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} leftIcon={<Lock size={18} className="text-gray-400" />} required fullWidth />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="text-orange-500 hover:text-orange-600">Forgot your password?</Link>
              </div>
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account?</span>
            <Link to={`/signup${role === 'host' ? '?role=host' : ''}`} className="ml-1 text-orange-500 hover:text-orange-600 font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;