import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, MessageCircle, User, Clock, LogOut, Home, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isHost, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      getProfile();
    }
  }, [user]);

  const getProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', user?.id)
        .single();

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleListSpace = () => {
    navigate('/list-space');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-orange-500">R4H</span>
                <span className="text-[10px] text-orange-400 -mt-1 italic">Rent for hours</span>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-500"
            >
              {i18n.language === 'en' ? 'ES' : 'EN'}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">
                  {t('spaces.title')}
                </Link>
                {isHost ? (
                  <Link to="/host/dashboard" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">
                    {t('dashboard.title')}
                  </Link>
                ) : (
                  <Link to="/bookings" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">
                    {t('booking.myBookings')}
                  </Link>
                )}
                <Link to="/messages" className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">
                  {t('messages.title')}
                </Link>
                {!isHost && (
                  <Button
                    variant="outline"
                    onClick={handleListSpace}
                    className="mr-4"
                  >
                    {t('spaces.listSpace')}
                  </Button>
                )}
                <div className="relative ml-3">
                  <Link to="/profile" className="flex items-center">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={user?.name || 'Profile'} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                        {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <span className="ml-2 text-sm font-medium text-gray-700">{user?.name}</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate('/login?role=host')}
                  className="mr-4"
                >
                  {t('auth.hostLogin')}
                </Button>
                <Link to="/login">
                  <Button variant="outline">{t('auth.signIn')}</Button>
                </Link>
                <Link to="/signup">
                  <Button>{t('auth.signUp')}</Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleLanguage}
              className="p-2 text-sm font-medium text-gray-700 hover:text-orange-500 mr-2"
            >
              {i18n.language === 'en' ? 'ES' : 'EN'}
            </button>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-orange-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-4 space-y-1 px-4 bg-white shadow-lg">
          {isAuthenticated ? (
            <>
              <div className="flex items-center py-3 border-b border-gray-200">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={user?.name || 'Profile'} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-lg">
                    {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-800">{user?.name}</p>
                  <p className="text-sm font-medium text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Link 
                to="/" 
                className="flex items-center py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={20} className="mr-3" />
                {t('spaces.title')}
              </Link>
              {isHost ? (
                <Link 
                  to="/host/dashboard" 
                  className="flex items-center py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard size={20} className="mr-3" />
                  {t('dashboard.title')}
                </Link>
              ) : (
                <Link 
                  to="/bookings" 
                  className="flex items-center py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Clock size={20} className="mr-3" />
                  {t('booking.myBookings')}
                </Link>
              )}
              <Link 
                to="/messages" 
                className="flex items-center py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageCircle size={20} className="mr-3" />
                {t('messages.title')}
              </Link>
              <Link 
                to="/profile" 
                className="flex items-center py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={20} className="mr-3" />
                {t('profile.title')}
              </Link>
              {!isHost && (
                <button
                  onClick={() => {
                    handleListSpace();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <Home size={20} className="mr-3" />
                  {t('spaces.listSpace')}
                </button>
              )}
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full py-3 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <LogOut size={20} className="mr-3" />
                {t('auth.signOut')}
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login?role=host" 
                className="block py-2 text-center text-gray-700 border border-gray-300 rounded-md mb-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('auth.hostLogin')}
              </Link>
              <Link 
                to="/login" 
                className="block py-2 text-center text-gray-700 border border-gray-300 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('auth.signIn')}
              </Link>
              <Link 
                to="/signup" 
                className="block py-2 mt-2 text-center text-white bg-orange-500 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('auth.signUp')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;