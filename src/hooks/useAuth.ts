import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuthUser extends User {
  profile?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    website_url?: string;
    location?: string;
    wallet_address?: string;
  };
  role?: 'admin' | 'moderator' | 'user';
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetching to avoid auth state change conflicts
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
                
              const { data: userRole } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();

              setUser({
                ...session.user,
                profile: profile || undefined,
                role: userRole?.role || 'user'
              });
            } catch (error) {
              console.error('Error fetching user data:', error);
              setUser(session.user as AuthUser);
            }
          }, 0);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      // If user is immediately confirmed (email confirmation disabled)
      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Account created successfully! Please check your email for verification.');
      } else {
        toast.success('Account created and signed in successfully!');
      }
      
      return { error: null };
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('Welcome back!');
      return { error: null };
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      toast.success('Signed out successfully');
      return { error: null };
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<AuthUser['profile']>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        toast.error(error.message);
        return { error };
      }

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        profile: { ...prev.profile, ...updates }
      } : null);

      toast.success('Profile updated successfully');
      return { error: null };
    } catch (error: any) {
      toast.error('Failed to update profile');
      return { error };
    }
  };

  const signInWithWallet = async (walletAddress: string) => {
    try {
      // Create a wallet-based user account
      const { data, error } = await supabase.auth.signUp({
        email: `${walletAddress.toLowerCase()}@wallet.temp`,
        password: `wallet_${walletAddress.slice(2, 18)}`,
        options: {
          data: {
            full_name: `User_${walletAddress.slice(2, 8)}`,
            is_wallet_user: true,
            wallet_address: walletAddress
          }
        }
      });

      if (error && error.message?.includes('already registered')) {
        // Try to sign in instead
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: `${walletAddress.toLowerCase()}@wallet.temp`,
          password: `wallet_${walletAddress.slice(2, 18)}`
        });
        
        if (signInError) {
          toast.error('Failed to authenticate with wallet');
          return { error: signInError };
        }
      } else if (error) {
        toast.error('Failed to create wallet account');
        return { error };
      }

      toast.success('Wallet authenticated successfully!');
      return { error: null };
    } catch (error: any) {
      toast.error('Wallet authentication failed');
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    signInWithWallet
  };
};