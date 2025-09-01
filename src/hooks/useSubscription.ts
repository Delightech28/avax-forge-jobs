import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { getContract } from '@/lib/subscriptionContract';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export type PlanType = 'ProMonthly' | 'ProAnnual' | 'EliteMonthly' | 'EliteAnnual';
export const PLAN_ENUM: Record<PlanType, number> = {
  ProMonthly: 1,
  ProAnnual: 2,
  EliteMonthly: 3,
  EliteAnnual: 4,
};

export function useSubscription(userId?: string, walletAddress?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiration, setExpiration] = useState<number | null>(null);
  const [activePlan, setActivePlan] = useState<PlanType | null>(null);

  // Subscribe to a plan
  const subscribe = useCallback(async (plan: PlanType) => {
    setLoading(true);
    setError(null);
    try {
      if (!window.ethereum) throw new Error('No wallet found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const planId = PLAN_ENUM[plan];
      const price = await contract.getPlanPrice(planId);
      const tx = await contract.subscribe(planId, { value: price });
      await tx.wait();
      // Get expiration after subscribing
      const exp = await contract.getUserExpiration(walletAddress);
      setExpiration(Number(exp));
      setActivePlan(plan);
      // Update Firestore verified status
      if (userId) {
        await updateDoc(doc(db, 'users', userId), {
          verified: plan,
          subscriptionExpiration: Number(exp),
        });
      }
      return true;
    } catch (err) {
      let msg = 'Subscription failed';
      if (typeof err === 'object' && err !== null && 'message' in err) {
        msg = (err as { message?: string }).message || msg;
      }
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, walletAddress]);

  // Check expiration
  const checkExpiration = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!window.ethereum) throw new Error('No wallet found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const exp = await contract.getUserExpiration(walletAddress);
      setExpiration(Number(exp));
      return Number(exp);
    } catch (err) {
      let msg = 'Failed to check expiration';
      if (typeof err === 'object' && err !== null && 'message' in err) {
        msg = (err as { message?: string }).message || msg;
      }
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  // Get plan price
  const getPrice = useCallback(async (plan: PlanType) => {
    setLoading(true);
    setError(null);
    try {
      if (!window.ethereum) throw new Error('No wallet found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const planId = PLAN_ENUM[plan];
      const price = await contract.getPlanPrice(planId);
      return price;
    } catch (err) {
      let msg = 'Failed to get price';
      if (typeof err === 'object' && err !== null && 'message' in err) {
        msg = (err as { message?: string }).message || msg;
      }
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  return {
    loading,
    error,
    expiration,
    activePlan,
    subscribe,
    checkExpiration,
    getPrice,
  };
}
