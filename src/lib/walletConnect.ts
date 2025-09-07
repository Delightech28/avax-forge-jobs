import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';

export async function connectWalletConnect() {
  // Create WalletConnect Provider
  const provider = new WalletConnectProvider({
    rpc: {
      // Default RPC map - add chain IDs used by your dapp. 1 is Ethereum mainnet.
      1: 'https://cloudflare-eth.com',
    },
    qrcode: true,
  });

  // Enable session (triggers QR Code modal)
  await provider.enable();

  const ethersProvider = new ethers.BrowserProvider(provider as any);
  const signer = await ethersProvider.getSigner();
  return { provider, ethersProvider, signer };
}
