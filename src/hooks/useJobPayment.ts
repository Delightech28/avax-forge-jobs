import { useState } from "react";
import { ethers } from "ethers";
import { db } from "@/integrations/firebase/client";
import { collection, addDoc } from "firebase/firestore";

const CONTRACT_ADDRESS = "0x068afd63c63ddb11f9061a9038e59038d37dfd86";
const ABI = [
  { "inputs": [ { "internalType": "string", "name": "verifiedLevel", "type": "string" } ], "name": "postJob", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [ { "internalType": "uint256", "name": "_avaxUsdPrice", "type": "uint256" }, { "internalType": "uint256", "name": "_basic", "type": "uint256" }, { "internalType": "uint256", "name": "_pro", "type": "uint256" }, { "internalType": "uint256", "name": "_elite", "type": "uint256" } ], "name": "setPrices", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "company", "type": "address" }, { "internalType": "bool", "name": "proAnnual", "type": "bool" }, { "internalType": "bool", "name": "eliteAnnual", "type": "bool" } ], "name": "setUnlimited", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "_treasury", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" },
  { "inputs": [], "name": "avaxUsdPrice", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "priceBasic", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "priceEliteMonthly", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "priceProMonthly", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "treasury", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "unlimitedEliteAnnual", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "unlimitedProAnnual", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }
];

export function useJobPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  async function payAndPostJob({ verifiedLevel, jobData }) {
    setLoading(true);
    setError("");
    setTxHash("");
    try {
      if (!window.ethereum) throw new Error("MetaMask is required");
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      // Fetch AVAX price and job price from contract
      const avaxUsdPrice = await contract.avaxUsdPrice();
      let priceUsd = 0n;
      if (verifiedLevel === "Basic") priceUsd = await contract.priceBasic();
      else if (verifiedLevel === "Pro Monthly") priceUsd = await contract.priceProMonthly();
      else if (verifiedLevel === "Elite Monthly") priceUsd = await contract.priceEliteMonthly();
      // For annual, check unlimited mapping (optional, or set priceUsd = 0n)

      // Calculate required AVAX
      const requiredAvax = priceUsd > 0n ? ethers.parseEther((Number(priceUsd) / Number(avaxUsdPrice)).toString()) : 0n;

      // Send transaction
      const tx = await contract.postJob(verifiedLevel, { value: requiredAvax });
      await tx.wait();
      setTxHash(tx.hash);

      // Post job to Firestore
      const docRef = await addDoc(collection(db, "jobs"), jobData);
      return { txHash: tx.hash, jobId: docRef.id };
    } catch (err) {
      setError(err.message || "Payment failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { payAndPostJob, loading, error, txHash };
}
