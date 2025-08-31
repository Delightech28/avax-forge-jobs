import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RED = "#ef4444"; // Tailwind red-500

const tiers = [
  {
    name: "Basic",
    price: "Free",
    features: [
      "Create profile & basic resume upload",
      "Access to 5 job listings per month",
      "Apply to 2 jobs per month",
      "Basic AI assistance: resume keyword check",
      "Access to community forums",
    ],
    highlight: false,
    cta: "Current Plan",
    disabled: true,
  },
  {
    name: "Pro Plan",
    price: "$5 / month",
    features: [
      "Unlimited Job application",
      "Priority listing visibility for employers",
      "AI - Powered resume builder & Optimization",
      "AI mock interview & personalized tips",
      "Early access to premium job postings",
      "Custom job alert",
      "Full access to community forums with Pro badges.",
      "Send message",
      "Download CV",
    ],
    highlight: true,
    cta: "Subscribe & Go Pro",
    disabled: false,
  },
  {
    name: "Elite Plan",
    price: "$25 / month",
    features: [
      "One-on-One career opportunities.",
      "AI career roadmap & skill building plan",
      "Exclusive networking event & webinars",
      "Access to freelance gigs & remote-only premium jobs.",
      "Top tier visibility in employer search results.",
      "VIP Community forum access (Private group with experts & recruiters)",
    ],
    highlight: false,
    cta: "Upgrade to Elite",
    disabled: false,
  },
];




// Import Ethereum type and window.ethereum declaration
import { Ethereum } from "../types/ethereum";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const GetVerified = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [showModal, setShowModal] = useState(false);
  const [modalPlanIdx, setModalPlanIdx] = useState<number | null>(null);
  const [modalPeriod, setModalPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);

  // Fetch wallet address from Firestore on modal open
  useEffect(() => {
    const fetchWallet = async () => {
      setLoadingWallet(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore();
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setWalletAddress(userSnap.data().walletAddress || null);
          }
        }
      } catch (err) {
        setWalletAddress(null);
      } finally {
        setLoadingWallet(false);
      }
    };
    if (showModal) fetchWallet();
  }, [showModal]);

  // MetaMask wallet connect logic
  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed. Please install MetaMask to connect your wallet.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      if (!address) throw new Error('No account found');
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { walletAddress: address }, { merge: true });
      setWalletAddress(address);
    } catch (err) {
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  // Pricing and CTA for each plan by billing period
  const planData = {
    monthly: [
      {
        price: "Free",
        cta: "Current Plan",
      },
      {
        price: "$5 / month",
        cta: "Subscribe & Go Pro",
      },
      {
        price: "$25 / month",
        cta: "Upgrade to Elite",
      },
    ],
    annual: [
      {
        price: "Free",
        cta: "Current Plan",
      },
      {
        price: "$100 / year",
        cta: "Subscribe & Go Pro",
      },
      {
        price: "$250 / year",
        cta: "Upgrade to Elite",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white relative">
      {/* X icon top left */}
      <button
        className="absolute top-6 left-6 z-20 bg-white/10 hover:bg-white/20 rounded-full p-2 border border-white/20"
        onClick={() => navigate('/profile')}
        aria-label="Close"
      >
        <X className="h-6 w-6 text-red-500" />
      </button>
      <main className="container mx-auto px-4 py-12 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center mt-12 sm:mt-0">Upgrade to Verified</h1>
        <p className="text-lg text-slate-300 mb-8 text-center max-w-2xl">
          Enjoy a trusted experience, exclusive job access, and priority support. Stand out to employers and unlock premium features.
        </p>


        {/* Monthly/Annual toggle UI styled like reference image */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex bg-[#111827] rounded-full p-1 gap-1 border border-slate-700 shadow-inner">
            <button
              className={`px-5 py-1.5 rounded-full font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 shadow ${billingPeriod === 'monthly' ? 'text-white bg-red-600' : 'text-slate-300 bg-transparent hover:bg-slate-800'}`}
              style={{ zIndex: 1 }}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <div className="relative flex items-center">
              <button
                className={`px-5 py-1.5 rounded-full font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 ${billingPeriod === 'annual' ? 'text-white bg-red-600 shadow' : 'text-slate-300 bg-transparent hover:bg-slate-800'}`}
                style={{ zIndex: 1 }}
                onClick={() => setBillingPeriod('annual')}
              >
                Annual
              </button>
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-xs px-2 py-0.5 rounded-full font-semibold shadow text-white whitespace-nowrap">Best Value</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl overflow-x-auto mt-3 md:mt-0">
          <div className="flex flex-nowrap gap-6 py-2" style={{ minHeight: 420 }}>
            {tiers.map((tier, idx) => {
              // Determine if this card is selected (on desktop)
              const isSelected = selected === idx;
              const isBasic = idx === 0;
              const handleModalOpen = () => {
                setModalPlanIdx(idx);
                setModalPeriod(billingPeriod);
                setShowModal(true);
              };
              return (
                <div
                  key={tier.name}
                  tabIndex={0}
                  onClick={() => setSelected(idx)}
                  className={`flex-shrink-0 w-[300px] sm:w-[340px] md:w-auto bg-[#111827] rounded-2xl shadow-lg border-2 mt-10 flex flex-col p-6 relative pt-8 md:pt-6 ${isBasic ? 'cursor-default' : 'cursor-pointer'}
                    transition-all duration-300
                    ${tier.highlight && selected === null ? "border-red-500 scale-105" : ""}
                    ${isSelected ? "md:border-red-500 md:scale-105" : "md:border-slate-700 md:scale-100"}
                    ${!isSelected && !tier.highlight && selected !== null ? "md:border-slate-700 md:scale-100" : ""}
                  `}
                  style={{ outline: "none" }}
                >
                  {tier.highlight && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-xs px-3 py-1 rounded-full font-semibold shadow text-white">Most Popular</span>
                  )}
                  <h2 className="text-xl font-bold mb-2 text-center">{tier.name}</h2>
                  <div className="text-3xl font-extrabold mb-2 text-center">{planData[billingPeriod][idx].price}</div>
                  <ul className="mb-6 space-y-2 text-sm text-slate-200">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {!isBasic && (
                    <button
                      className={`w-full py-2 rounded-lg font-semibold mt-auto transition-all duration-150 ${
                        tier.highlight
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600"
                      }`}
                      onClick={handleModalOpen}
                    >
                      {planData[billingPeriod][idx].cta}
                    </button>
                  )}
                  {isBasic && (
                    <button
                      className="w-full py-2 rounded-lg font-semibold mt-auto transition-all duration-150 bg-slate-800 text-slate-200 border border-slate-600 opacity-60 cursor-not-allowed"
                      disabled
                    >
                      {planData[billingPeriod][idx].cta}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Modal for subscribe/upgrade - mobile slide up */}
        {showModal && modalPlanIdx !== null && (
          <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center bg-black/40" onClick={() => setShowModal(false)}>
            <div
              className="w-full max-w-md bg-[#181f2a] rounded-t-2xl p-6 shadow-lg animate-slideUp relative"
              style={{ maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              <button className="absolute top-2 right-4 text-slate-400 hover:text-white text-xl" onClick={() => setShowModal(false)}>&times;</button>
              {/* Plan badge at top left */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${modalPlanIdx === 1 ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'}`}>{tiers[modalPlanIdx].name}</span>
              </div>
              {/* Plan selection cards */}
              <div className="flex flex-col gap-3 mt-6 mb-6">
                {modalPeriod === 'annual' && (
                  <div
                    className={`border rounded-xl p-4 flex flex-col gap-1 cursor-pointer transition-all border-red-500 bg-[#232b3b]`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Plan</span>
                      <span className="bg-green-600 text-xs px-2 py-0.5 rounded-full font-semibold text-white ml-2">SAVE 15%</span>
                    </div>
                    <div className="text-lg font-bold mt-1">{planData.annual[modalPlanIdx].price.replace('/ year', '')} <span className="text-xs font-normal text-slate-400">/ year billed annually</span></div>
                    <div className="text-xs text-slate-400">${modalPlanIdx === 1 ? '8.33' : modalPlanIdx === 2 ? '20.83' : '0'} / month</div>
                  </div>
                )}
                {modalPeriod === 'monthly' && (
                  <div
                    className={`border rounded-xl p-4 flex flex-col gap-1 cursor-pointer transition-all border-red-500 bg-[#232b3b]`}
                  >
                    <span className="font-semibold">Monthly plan</span>
                    <div className="text-lg font-bold mt-1">{planData.monthly[modalPlanIdx].price.replace('/ month', '')} <span className="text-xs font-normal text-slate-400">/ month</span></div>
                    <div className="text-xs text-slate-400">${modalPlanIdx === 1 ? '5' : modalPlanIdx === 2 ? '25' : '0'} / month billed monthly</div>
                  </div>
                )}
              </div>
              {/* Wallet address logic and subscribe button */}
              <div className="mb-4 text-center">
                {loadingWallet && (
                  <span className="text-slate-400">Loading wallet...</span>
                )}
              </div>
              <button
                className={`w-full py-3 rounded-full font-bold text-lg transition-all duration-150 ${walletAddress ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                disabled={!walletAddress}
              >
                Subscribe & Pay
              </button>
              {!walletAddress && !loadingWallet && (
                <div className="mt-3 text-center">
                  <span
                    className="text-red-400 underline cursor-pointer"
                    onClick={handleConnectWallet}
                  >
                    Please connect your wallet
                  </span>
                </div>
              )}
              {walletAddress && !loadingWallet && (
                <div className="mt-3 text-center">
                  <span className="text-green-500 font-mono">{walletAddress}</span>
                </div>
              )}
            </div>
            {/* Slide up animation */}
            <style>{`
              @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
              .animate-slideUp { animation: slideUp 0.3s cubic-bezier(.4,2,.6,1) both; }
            `}</style>
          </div>
        )}
      </main>
    </div>
  );
};

export default GetVerified;
