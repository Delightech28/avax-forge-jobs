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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { validatePassword, validateEmail, checkRateLimit } from '@/utils/validation';
import { checkEmailRoleConflict } from '@/utils/userValidation';
type Session = null;

export interface AuthUser {
  id: string;
  uid: string;
  email: string;
  fullName?: string;
  role?: 'admin' | 'moderator' | 'user' | 'company';
  walletAddress?: string;
  createdAt?: string;
  verified?: string;
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
        // Check if user doc exists in Firestore
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          // Create a minimal user doc if missing
          await setDoc(userDocRef, {
            email: fbUser.email || '',
            fullName: fbUser.displayName || '',
            role: 'user',
            verified: 'Basic',
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          }, { merge: true });
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
      // Rate limiting check
      if (!checkRateLimit(`signup_${email}`, 3, 15 * 60 * 1000)) {
        toast.error('Too many signup attempts. Please try again in 15 minutes.');
        return { error: new Error('Rate limit exceeded') };
      }

      // Validate email format
      if (!validateEmail(email)) {
        toast.error('Please enter a valid email address.');
        return { error: new Error('Invalid email format') };
      }

      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        toast.error(`Password requirements not met:\n${passwordValidation.errors.join('\n')}`);
        return { error: new Error('Weak password') };
      }

      // Check if email already exists with a different role
      const emailCheck = await checkEmailRoleConflict(email, role);
      if (emailCheck.exists) {
        toast.error(emailCheck.message || 'Email already in use');
        return { error: new Error(emailCheck.message || 'Email already in use') };
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (fullName) {
        await updateAuthProfile(cred.user, { displayName: fullName });
      }
      // Create user profile doc
      const userRef = doc(db, 'users', cred.user.uid);
      await setDoc(userRef, {
        email: email.toLowerCase(), // Store email in lowercase for consistency
        fullName: fullName || cred.user.displayName || '',
        role: role,
        verified: 'Basic',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        signupIp: 'client-side', // In a real app, you'd get this from the server
      }, { merge: true });
      const mapped = await mapFirebaseUserToAuthUser(cred.user);
      setUser(mapped);
      toast.success('Account created and signed in successfully!');
      return { error: null };
    } catch (error: unknown) {
      // Handle specific Firebase auth errors with user-friendly messages
      let errorMessage = 'Failed to create account. Please try again.';
      // Log the actual error for debugging (but don't show to user)
      if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
        const code = (error as { code?: string }).code;
        const message = (error as { message?: string }).message;
        console.log('Firebase signup error:', code, message);
        switch (code) {
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists. Please sign in instead.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password does not meet security requirements. Please use a stronger password.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password sign up is not enabled. Please contact support.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          case 'auth/internal-error':
            errorMessage = 'An internal error occurred. Please try again.';
            break;
        }
      } else {
        console.log('Firebase signup error:', error);
      }
      toast.error(errorMessage);
      return { error: new Error(errorMessage) };
    }
  };


  const signIn = async (email: string, password: string) => {
    try {
      // Rate limiting check for sign in attempts
      if (!checkRateLimit(`signin_${email}`, 5, 15 * 60 * 1000)) {
        toast.error('Too many sign in attempts. Please try again in 15 minutes.');
        return { error: new Error('Rate limit exceeded') };
      }

      // Validate email format
      if (!validateEmail(email)) {
        toast.error('Please enter a valid email address.');
        return { error: new Error('Invalid email format') };
      }

      const cred = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time
      const userRef = doc(db, 'users', cred.user.uid);
      const userSnapshot = await getDoc(userRef);
      const prevLoginCount = userSnapshot.exists() && typeof userSnapshot.data().loginCount === 'number'
        ? userSnapshot.data().loginCount
        : 0;
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        loginCount: prevLoginCount + 1,
      });

      const mapped = await mapFirebaseUserToAuthUser(cred.user);
      setUser(mapped);
      toast.success('Welcome back!');
      return { error: null };
    } catch (error: unknown) {
      // Handle specific Firebase auth errors with user-friendly messages
      let errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
        const code = (error as { code?: string }).code;
        const message = (error as { message?: string }).message;
        console.log('Firebase auth error:', code, message);
        switch (code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email. Please sign up first.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password sign in is not enabled. Please contact support.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          case 'auth/internal-error':
            errorMessage = 'An internal error occurred. Please try again.';
            break;
        }
      } else {
        console.log('Firebase auth error:', error);
      }
      toast.error(errorMessage);
      return { error: new Error(errorMessage) };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast.success('Signed out successfully');
      return { error: null };
    } catch (error: unknown) {
      toast.error('Failed to sign out. Please try again.');
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<Pick<AuthUser, 'fullName' | 'walletAddress'> & { bio: string; location: string; websiteUrl: string; avatarUrl: string }>) => {
    if (!user) return { error: new Error('No user logged in') };
    try {
      const userRef = doc(db, 'users', user.id);
      // Convert updates to proper Firestore format
  const firestoreUpdates: Record<string, unknown> = {};
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
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
      return { error };
    }
  };

  const signInWithWallet = async (_walletAddress: string) => {
    try {
      interface EthereumProvider {
        request: (args: { method: string }) => Promise<string[]>;
      }
      const ethereum = (window as { ethereum?: EthereumProvider }).ethereum;
      if (!ethereum) return { error: new Error('No wallet') };
      const provider: EthereumProvider = ethereum;
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
    } catch (error: unknown) {
      console.error('Wallet connection error:', error);
      
      // Handle specific wallet errors
      let errorMessage = 'Wallet connection failed';
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as { code?: unknown }).code !== 'undefined'
      ) {
        if ((error as { code: unknown }).code === 4001) {
          errorMessage = 'Wallet connection was rejected by user';
        } else if ((error as { code: unknown }).code === -32002) {
          errorMessage = 'Wallet connection request already pending';
        }
      }
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string' &&
        ((error as { message: string }).message.includes('User rejected'))
      ) {
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
  interface UserProfile {
    fullName?: string;
    role?: 'admin' | 'moderator' | 'user' | 'company';
    walletAddress?: string;
    createdAt?: string | Date | { toDate: () => Date } | undefined;
    [key: string]: unknown;
  }
  const profile: UserProfile = snapshot.exists() ? snapshot.data() as UserProfile : {};
  
  // Handle Firebase timestamp conversion properly
  let createdAt: string | undefined;
  if (profile.createdAt) {
    if (
      typeof profile.createdAt === 'object' &&
      profile.createdAt !== null &&
      typeof (profile.createdAt as { toDate?: unknown }).toDate === 'function'
    ) {
      createdAt = (profile.createdAt as { toDate: () => Date }).toDate().toISOString();
    } else if (profile.createdAt instanceof Date) {
      createdAt = profile.createdAt.toISOString();
    } else if (typeof profile.createdAt === 'string') {
      createdAt = profile.createdAt;
    }
  }
  
  return {
    id: fbUser.uid,
    uid: fbUser.uid,
    email: fbUser.email || '',
    fullName: profile.fullName || fbUser.displayName || undefined,
    role: profile.role || 'user',
    walletAddress: profile.walletAddress || undefined,
    createdAt: createdAt,
    verified: profile.verified || 'Basic',
    ...profile,
  } as AuthUser;
}