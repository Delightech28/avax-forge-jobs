import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export interface EmailRoleCheck {
  exists: boolean;
  existingRole?: 'user' | 'company';
  message?: string;
}

/**
 * Check if an email is already registered with a different role
 * @param email - The email to check
 * @param requestedRole - The role the user is trying to register for
 * @returns Promise<EmailRoleCheck>
 */
export const checkEmailRoleConflict = async (
  email: string, 
  requestedRole: 'user' | 'company'
): Promise<EmailRoleCheck> => {
  try {
    const usersRef = collection(db, 'users');
    const emailQuery = query(usersRef, where('email', '==', email.toLowerCase()));
    const emailSnapshot = await getDocs(emailQuery);
    
    if (emailSnapshot.empty) {
      return { exists: false };
    }
    
    const existingUser = emailSnapshot.docs[0].data();
    const existingRole = existingUser.role as 'user' | 'company';
    
    if (existingRole !== requestedRole) {
      const roleNames = {
        user: 'job seeker',
        company: 'employer'
      };
      
      return {
        exists: true,
        existingRole,
        message: `This email is already registered as a ${roleNames[existingRole]}. You cannot use the same email for both account types.`
      };
    }
    
    return {
      exists: true,
      existingRole,
      message: 'An account with this email already exists. Please sign in instead.'
    };
  } catch (error) {
    console.error('Error checking email role conflict:', error);
    return {
      exists: false,
      message: 'Error checking email availability. Please try again.'
    };
  }
};

/**
 * Get user statistics for security monitoring
 */
export const getUserStats = async (userId: string) => {
  try {
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('__name__', '==', userId));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      return null;
    }
    
    const userData = userSnapshot.docs[0].data();
    return {
      loginCount: userData.loginCount || 0,
      lastLoginAt: userData.lastLoginAt,
      createdAt: userData.createdAt,
      role: userData.role,
      email: userData.email
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
};
