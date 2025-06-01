import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isHost: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: 'user' | 'host') => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'user' | 'host') => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleProfileSetup = async (
    userId: string,
    email: string,
    name: string,
    role: 'user' | 'host' = 'user'
  ) => {
    try {
      // First check if the profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        throw fetchError;
      }

      if (existingProfile) {
        return existingProfile;
      }

      // If no profile exists, create one with a transaction-like approach
      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .upsert([
          {
            id: userId,
            name,
            email,
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ], {
          onConflict: 'id',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        throw insertError;
      }

      return newProfile;
    } catch (error) {
      console.error('Error in handleProfileSetup:', error);
      throw error;
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    const syncSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
    
        if (error || !session?.user) {
          setUser(null);
          setIsAuthenticated(false);
          setIsHost(false);
        } else {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
            setIsAuthenticated(true);
            setIsHost(profile.role === 'host');
          }
        }
      } catch (error) {
        console.error('Error syncing session:', error);
        setUser(null);
        setIsAuthenticated(false);
        setIsHost(false);
      } finally {
        setIsLoading(false);
      }
    };
  
    syncSession();
  
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
            setIsAuthenticated(true);
            setIsHost(profile.role === 'host');
          }
        } catch (error) {
          console.error('Error fetching profile on auth change:', error);
          setUser(null);
          setIsAuthenticated(false);
          setIsHost(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsHost(false);
      }
    });
  
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: 'user' | 'host' = 'user') => {
    try {
      setIsLoading(true);
      const { data: { user: authUser }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Email not confirmed') {
          throw new Error('Please check your email and confirm your account before logging in.');
        }
        throw error;
      }

      if (authUser) {
        const profile = await fetchUserProfile(authUser.id);
        if (!profile) {
          throw new Error('User profile not found. Please contact support.');
        }

        if (role === 'host' && profile.role !== 'host') {
          throw new Error('This account does not have host privileges.');
        }

        setUser(profile);
        setIsHost(profile.role === 'host');
        setIsAuthenticated(true);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      setIsHost(false);

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        const errorMessage = error.message.toLowerCase();
        const nonCriticalErrors = ['session_not_found', 'auth session missing'];
        
        if (!nonCriticalErrors.some(msg => errorMessage.includes(msg))) {
          throw error;
        }
      }
    } catch (error: any) {
      const errorMessage = error.message.toLowerCase();
      const nonCriticalErrors = ['session_not_found', 'auth session missing'];
      
      if (!nonCriticalErrors.some(msg => errorMessage.includes(msg))) {
        console.error('Logout failed:', error);
        throw error;
      }
    }
  };

  const register = async (name: string, email: string, password: string, role: 'user' | 'host' = 'user') => {
    try {
      setIsLoading(true);

      // First create the auth user
      const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authUser) throw new Error('Failed to create user account.');

      // Then attempt to create the profile
      try {
        const profile = await handleProfileSetup(authUser.id, email, name, role);
        if (!profile) {
          throw new Error('Failed to create user profile.');
        }

        // Check if email confirmation is required
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          return {
            message: '✅ A verification email has been sent to your inbox. Please check your email to activate your account.'
          };
        }

        setUser(profile);
        setIsAuthenticated(true);
        setIsHost(role === 'host');

        return {
          message: '✅ Account created successfully! You can now log in.'
        };
      } catch (profileError) {
        // If profile creation fails, clean up by deleting the auth user
        await supabase.auth.admin.deleteUser(authUser.id);
        throw new Error('Failed to create user profile. Please try again.');
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isHost, 
      isLoading,
      login, 
      logout, 
      register 
    }}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};