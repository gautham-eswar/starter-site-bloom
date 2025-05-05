
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Handle hash fragment redirect (when coming back from OAuth)
  useEffect(() => {
    // Check if we have an access token in the URL hash
    if (window.location.hash && window.location.hash.includes('access_token')) {
      // Extract the hash and construct the URL
      const hashUrl = window.location.href;
      
      // Process the hash to retrieve session
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          toast({
            title: 'Signed in successfully',
            description: `Welcome ${data.session.user.email}!`,
          });
          // Clean up URL by replacing the current hash with nothing
          window.history.replaceState({}, document.title, window.location.pathname);
          // Redirect to home page
          navigate('/');
        }
      });
    }
  }, [navigate]);

  useEffect(() => {
    // Handle auth changes and maintain state between page refreshes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (event === 'SIGNED_IN') {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          toast({
            title: 'Signed in successfully',
            description: `Welcome ${newSession?.user?.email}!`,
          });
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          toast({
            title: 'Signed out',
            description: 'You have been signed out successfully.',
          });
        } else if (event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        } else {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
