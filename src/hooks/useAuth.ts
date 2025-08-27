import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { auth, db } from '@/integrations/firebase/client';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as updateAuthProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
type Session = null;

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role?: 'admin' | 'moderator' | 'user' | 'company';
  walletAddress?: string;
  createdAt?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (!fbUser) {
          setUser(null);
          return;
        }
        const mapped = await mapFirebaseUserToAuthUser(fbUser);
        setUser(mapped);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, role: 'user' | 'company' = 'user') => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (fullName) {
        await updateAuthProfile(cred.user, { displayName: fullName });
      }
      // Create user profile doc
      const userRef = doc(db, 'users', cred.user.uid);
      await setDoc(userRef, {
        email,
        fullName: fullName || cred.user.displayName || '',
        role: role,
        createdAt: serverTimestamp(),
      }, { merge: true });
      const mapped = await mapFirebaseUserToAuthUser(cred.user);
      setUser(mapped);
      toast.success('Account created and signed in successfully!');
      return { error: null };
    } catch (error: any) {
      // Handle specific Firebase auth errors
      let errorMessage = 'An unexpected error occurred';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password sign up is not enabled. Please contact support.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      toast.error(errorMessage);
      return { error };
    }
  };


  const signIn = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const mapped = await mapFirebaseUserToAuthUser(cred.user);
      setUser(mapped);
      toast.success('Welcome back!');
      return { error: null };
    } catch (error: any) {
      // Handle specific Firebase auth errors
      let errorMessage = 'An unexpected error occurred';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password sign in is not enabled. Please contact support.';
      }
      
      toast.error(errorMessage);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast.success('Signed out successfully');
      return { error: null };
    } catch (error: any) {
      toast.error('Failed to sign out. Please try again.');
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<Pick<AuthUser, 'fullName' | 'walletAddress'> & { bio: string; location: string; websiteUrl: string; avatarUrl: string }>) => {
    if (!user) return { error: new Error('No user logged in') };
    try {
      const userRef = doc(db, 'users', user.id);
      // Convert updates to proper Firestore format
      const firestoreUpdates: any = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          firestoreUpdates[key] = value;
        }
      });
      
      await updateDoc(userRef, firestoreUpdates);
      if (typeof updates.fullName === 'string' && updates.fullName) {
        // Update displayName in Auth as well
        const fbCurrent = auth.currentUser;
        if (fbCurrent) {
          await updateAuthProfile(fbCurrent, { displayName: updates.fullName });
        }
      }
      // Update local user state immediately
      setUser(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
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

      // Without a custom backend, we cannot safely verify signatures.
      // We'll store the wallet address in the user's Firestore profile for now.
      const current = auth.currentUser;
      if (!current) return { error: new Error('Not signed in') };
      await updateDoc(doc(db, 'users', current.uid), { walletAddress: address });
      const mapped = await mapFirebaseUserToAuthUser(current);
      setUser({ ...mapped, walletAddress: address });
      toast.success('Wallet connected');
      return { error: null };
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      // Handle specific wallet errors
      let errorMessage = 'Wallet connection failed';
      if (error.code === 4001) {
        errorMessage = 'Wallet connection was rejected by user';
      } else if (error.code === -32002) {
        errorMessage = 'Wallet connection request already pending';
      } else if (error.message?.includes('User rejected')) {
        errorMessage = 'Wallet connection was cancelled';
      }
      
      toast.error(errorMessage);
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

async function mapFirebaseUserToAuthUser(fbUser: FirebaseUser): Promise<AuthUser> {
  const profileRef = doc(db, 'users', fbUser.uid);
  const snapshot = await getDoc(profileRef);
  const profile = snapshot.exists() ? snapshot.data() as any : {};
  
  // Handle Firebase timestamp conversion properly
  let createdAt: string | undefined;
  if (profile.createdAt) {
    if (profile.createdAt.toDate) {
      createdAt = profile.createdAt.toDate().toISOString();
    } else if (profile.createdAt instanceof Date) {
      createdAt = profile.createdAt.toISOString();
    } else if (typeof profile.createdAt === 'string') {
      createdAt = profile.createdAt;
    }
  }
  
  return {
    id: fbUser.uid,
    email: fbUser.email || '',
    fullName: profile.fullName || fbUser.displayName || undefined,
    role: profile.role || 'user',
    walletAddress: profile.walletAddress || undefined,
    createdAt: createdAt,
    ...profile,
  } as AuthUser;
}