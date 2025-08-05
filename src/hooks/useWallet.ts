import { useState, useEffect } from 'react';
import { toast } from 'sonner';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

export const useWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setWalletAddress(null);
          setIsConnected(false);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected. Please install MetaMask.');
      return { success: false };
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        toast.success('Wallet connected successfully!');
        return { success: true, address: accounts[0] };
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('Wallet connection rejected');
      } else {
        toast.error('Failed to connect wallet');
      }
      console.error('Error connecting wallet:', error);
      return { success: false };
    } finally {
      setIsConnecting(false);
    }

    return { success: false };
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    toast.success('Wallet disconnected');
  };

  const switchToAvalanche = async () => {
    if (!window.ethereum) return { success: false };

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xA86A' }], // Avalanche mainnet
      });
      return { success: true };
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xA86A',
                chainName: 'Avalanche C-Chain',
                nativeCurrency: {
                  name: 'AVAX',
                  symbol: 'AVAX',
                  decimals: 18,
                },
                rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
                blockExplorerUrls: ['https://snowtrace.io/'],
              },
            ],
          });
          return { success: true };
        } catch (addError) {
          toast.error('Failed to add Avalanche network');
          return { success: false };
        }
      }
      toast.error('Failed to switch to Avalanche network');
      return { success: false };
    }
  };

  return {
    walletAddress,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToAvalanche
  };
};