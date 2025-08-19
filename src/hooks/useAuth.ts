import { useState, useEffect } from 'react';
import { toast } from 'sonner';
type Session = null;

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role?: 'admin' | 'moderator' | 'user';
  walletAddress?: string;
  createdAt?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await fetch((window as any).API_BASE ? (window as any).API_BASE + '/api/auth/me' : '/api/auth/me', { credentials: 'include' });
        const body = await res.json();
        setUser(body.user || null);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadMe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const res = await fetch((window as any).API_BASE ? (window as any).API_BASE + '/api/auth/signup' : '/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Failed to sign up');
        return { error: new Error(body.error || 'Failed to sign up') };
      }
      setUser(body.user);
      toast.success('Account created and signed in successfully!');
      return { error: null };
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      return { error };
    }
  };


  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch((window as any).API_BASE ? (window as any).API_BASE + '/api/auth/login' : '/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Invalid credentials');
        return { error: new Error(body.error || 'Invalid credentials') };
      }
      setUser(body.user);
      toast.success('Welcome back!');
      return { error: null };
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await fetch((window as any).API_BASE ? (window as any).API_BASE + '/api/auth/logout' : '/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      toast.success('Signed out successfully');
      return { error: null };
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<Pick<AuthUser, 'fullName' | 'walletAddress'> & { bio: string; location: string; websiteUrl: string; avatarUrl: string }>) => {
    if (!user) return { error: new Error('No user logged in') };
    try {
      const res = await fetch((window as any).API_BASE ? (window as any).API_BASE + '/api/profile' : '/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || 'Failed to update profile');
        return { error: new Error(body.error || 'Failed to update profile') };
      }
      setUser(body.user);
      toast.success('Profile updated successfully');
      return { error: null };
    } catch (error: any) {
      toast.error('Failed to update profile');
      return { error };
    }
  };

  const signInWithWallet = async (_walletAddress: string) => {
    try {
      if (!(window as any).ethereum) return { error: new Error('No wallet') };
      const provider = (window as any).ethereum;
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const address = (accounts[0] || '').toLowerCase();
      if (!address) return { error: new Error('No account') };

      const nonceRes = await fetch(((window as any).API_BASE ? (window as any).API_BASE : '') + `/api/auth/wallet/nonce?address=${encodeURIComponent(address)}`, { credentials: 'include' });
      const { nonce } = await nonceRes.json();
      if (!nonce) return { error: new Error('Failed to get nonce') };

      const signature = await provider.request({ method: 'personal_sign', params: [nonce, address] });

      const verifyRes = await fetch((window as any).API_BASE ? (window as any).API_BASE + '/api/auth/wallet/verify' : '/api/auth/wallet/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, nonce })
      });
      const body = await verifyRes.json();
      if (!verifyRes.ok) {
        toast.error(body.error || 'Wallet authentication failed');
        return { error: new Error(body.error || 'Wallet authentication failed') };
      }
      setUser(body.user);
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