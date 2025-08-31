// src/types/ethereum.d.ts

export type Ethereum = {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: Array<unknown> }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: Ethereum;
  }
}

export {};
