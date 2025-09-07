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

      // Helper: request accounts and create provider/signer with one retry for transient MetaMask tracker errors
      const requestAccountsAndGetSigner = async () => {
        // First try MetaMask recommended request API
        try {
          await (window.ethereum as unknown as ethers.Eip1193Provider).request({ method: 'eth_requestAccounts' });
        } catch (reqErr) {
          // Some wallets or environments may still require provider.send; ignore and proceed to provider creation
          console.debug('eth_requestAccounts request failed, will try provider.send fallback', reqErr);
        }

        // Create provider and signer
        let provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
        try {
          const signer = await provider.getSigner();
          return { provider, signer };
        } catch (signerErr: unknown) {
          const msg = String(
            signerErr && typeof signerErr === 'object' && 'message' in signerErr
              ? (signerErr as { message?: string }).message
              : signerErr
          );
          // Known MetaMask transient errors: block tracker destroyed, circuit breaker
          if (msg.includes('Block tracker destroyed') || msg.toLowerCase().includes('circuit breaker')) {
            // retry once after short delay
            await new Promise((r) => setTimeout(r, 300));
            provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
            const signer = await provider.getSigner();
            return { provider, signer };
          }
          throw signerErr;
        }
      };

      const { signer } = await requestAccountsAndGetSigner();
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
        try {
          await updateDoc(doc(db, 'users', userId), {
            verified: plan,
            subscriptionExpiration: Number(exp),
          });
          // Store transaction history in Firestore
          const { addDoc, collection } = await import('firebase/firestore');
          await addDoc(collection(db, 'transactions'), {
            userId,
            type: 'Subscription',
            plan,
            amount: Number(price) / 1e18, // assuming price is in wei
            date: new Date().toISOString(),
            description: `Subscribed to ${plan}`,
            txHash: tx.hash,
          });
        } catch (firestoreErr) {
          // Log Firestore errors but do not set error state
          console.error('Firestore transaction history error:', firestoreErr);
        }
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
      // reuse same helper used in subscribe
      const requestAccountsAndGetSigner = async () => {
        try {
          await (window.ethereum as unknown as ethers.Eip1193Provider).request({ method: 'eth_requestAccounts' });
        } catch (reqErr) {
          console.debug('eth_requestAccounts request failed, will try provider.send fallback', reqErr);
        }
        let provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
        try {
          const signer = await provider.getSigner();
          return { provider, signer };
        } catch (signerErr: unknown) {
          const msg = String(
            signerErr && typeof signerErr === 'object' && 'message' in signerErr
              ? (signerErr as { message?: string }).message
              : signerErr
          );
          if (msg.includes('Block tracker destroyed') || msg.toLowerCase().includes('circuit breaker')) {
            await new Promise((r) => setTimeout(r, 300));
            provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
            const signer = await provider.getSigner();
            return { provider, signer };
          }
          throw signerErr;
        }
      };

      const { signer } = await requestAccountsAndGetSigner();
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
      const requestAccountsAndGetSigner = async () => {
        try {
          await (window.ethereum as unknown as ethers.Eip1193Provider).request({ method: 'eth_requestAccounts' });
        } catch (reqErr) {
          console.debug('eth_requestAccounts request failed, will try provider.send fallback', reqErr);
        }
        let provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
        try {
          const signer = await provider.getSigner();
          return { provider, signer };
        } catch (signerErr: unknown) {
          const msg = String(
            signerErr && typeof signerErr === 'object' && 'message' in signerErr
              ? (signerErr as { message?: string }).message
              : signerErr
          );
          if (msg.includes('Block tracker destroyed') || msg.toLowerCase().includes('circuit breaker')) {
            await new Promise((r) => setTimeout(r, 300));
            provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
            const signer = await provider.getSigner();
            return { provider, signer };
          }
          throw signerErr;
        }
      };

      const { signer } = await requestAccountsAndGetSigner();
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
  }, []);

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
