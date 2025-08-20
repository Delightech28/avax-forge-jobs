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
  role?: 'admin' | 'moderator' | 'user';
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

  const signUp = async (email: string, password: string, fullName?: string) => {
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
        role: 'user',
        createdAt: serverTimestamp(),
      }, { merge: true });
      const mapped = await mapFirebaseUserToAuthUser(cred.user);
      setUser(mapped);
      toast.success('Account created and signed in successfully!');
      return { error: null };
    } catch (error: any) {
      toast.error('An unexpected error occurred');
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
      toast.error('An unexpected error occurred');
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
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<Pick<AuthUser, 'fullName' | 'walletAddress'> & { bio: string; location: string; websiteUrl: string; avatarUrl: string }>) => {
    if (!user) return { error: new Error('No user logged in') };
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, updates as any);
      if (typeof updates.fullName === 'string' && updates.fullName) {
        // Update displayName in Auth as well
        const fbCurrent = auth.currentUser;
        if (fbCurrent) {
          await updateAuthProfile(fbCurrent, { displayName: updates.fullName });
        }
      }
      // Refresh local user
      const mapped = await mapFirebaseUserToAuthUser(auth.currentUser as FirebaseUser);
      // Merge Firestore profile fields we just updated
      setUser({ ...mapped, ...(updates as any) });
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

async function mapFirebaseUserToAuthUser(fbUser: FirebaseUser): Promise<AuthUser> {
  const profileRef = doc(db, 'users', fbUser.uid);
  const snapshot = await getDoc(profileRef);
  const profile = snapshot.exists() ? snapshot.data() as any : {};
  return {
    id: fbUser.uid,
    email: fbUser.email || '',
    fullName: profile.fullName || fbUser.displayName || undefined,
    role: profile.role || 'user',
    walletAddress: profile.walletAddress || undefined,
    createdAt: profile.createdAt?.toDate ? profile.createdAt.toDate().toISOString() : undefined,
    ...profile,
  } as AuthUser;
}