import { useState } from "react";
import { ethers } from "ethers";
import { db } from "@/integrations/firebase/client";
import { collection, addDoc } from "firebase/firestore";

const CONTRACT_ADDRESS = "0xb5b20b0d21bbae3844c3b6799fc4982a77316f98";
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

  async function payAndPostJob({ verifiedLevel, jobData, provider }) {
    setLoading(true);
    setError("");
    setTxHash("");
    try {
      if (!provider) throw new Error("No wallet provider found");
      // Request accounts
      if (provider.request) {
        await provider.request({ method: "eth_requestAccounts" });
      }
      // Check network
      let network = null;
      if (provider.request) {
        network = await provider.request({ method: "eth_chainId" });
      } else if (provider.chainId) {
        network = provider.chainId;
      }
      if (network !== "0xa869") {
        throw new Error("Please switch your wallet to Avalanche Fuji (Testnet) network.");
      }
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      // Fetch AVAX-native price from contract
      let requiredAvax = 0n;
      if (verifiedLevel === "Basic") requiredAvax = await contract.priceBasic();
      else if (verifiedLevel === "Pro Monthly") requiredAvax = await contract.priceProMonthly();
      else if (verifiedLevel === "Elite Monthly") requiredAvax = await contract.priceEliteMonthly();
      // For annual, check unlimited mapping (optional, or set requiredAvax = 0n)
      // Send transaction
      const tx = await contract.postJob(verifiedLevel, { value: requiredAvax });
      await tx.wait();
      setTxHash(tx.hash);
      // Post job to Firestore
      const docRef = await addDoc(collection(db, "jobs"), jobData);
      // Store job post payment in transactions collection
      await addDoc(collection(db, "transactions"), {
        userId: jobData.companyId || jobData.posted_by,
        txHash: tx.hash,
        amount: requiredAvax.toString(),
        date: new Date().toISOString(),
        description: "",
        type: "job_post",
      });
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
