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


import React, { useState } from "react";

const GetVerified = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);
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
              className="px-5 py-1.5 rounded-full font-semibold text-white bg-red-600 shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
              style={{ zIndex: 1 }}
            >
              Monthly
            </button>
            <div className="relative flex items-center">
              <button
                className="px-5 py-1.5 rounded-full font-semibold text-slate-300 bg-transparent hover:bg-slate-800 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                style={{ zIndex: 1 }}
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
              return (
                <div
                  key={tier.name}
                  tabIndex={0}
                  onClick={() => setSelected(idx)}
                  className={`flex-shrink-0 w-[300px] sm:w-[340px] md:w-auto bg-[#111827] rounded-2xl shadow-lg border-2 mt-10 flex flex-col p-6 relative pt-8 md:pt-6 cursor-pointer
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
                  <div className="text-3xl font-extrabold mb-2 text-center">{tier.price}</div>
                  <ul className="mb-6 space-y-2 text-sm text-slate-200">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-2 rounded-lg font-semibold mt-auto transition-all duration-150 ${
                      tier.highlight
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600"
                    } ${tier.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                    disabled={tier.disabled}
                  >
                    {tier.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-10 text-xs text-slate-400 text-center max-w-2xl">
          By subscribing, you agree to our <a href="#" className="underline">Terms of Service</a>. Subscriptions auto-renew until canceled. Cancel anytime.
        </div>
      </main>
    </div>
  );
};

export default GetVerified;
