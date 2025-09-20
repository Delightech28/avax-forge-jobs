import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";

interface WalletSelectModalProps {
  open: boolean;
  onSelect: (wallet: "metamask" | "core") => void;
  onClose: () => void;
}

export const WalletSelectModal: React.FC<WalletSelectModalProps> = ({ open, onSelect, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs text-center">
        <DialogHeader>
          <DialogTitle>Select a Wallet</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={() => onSelect("metamask")}
          >
            <img src="/metamask.png" alt="MetaMask" className="h-6 w-6" />
            MetaMask
          </Button>
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={() => onSelect("core")}
          >
            <img src="/core-wallet.png" alt="Core Wallet" className="h-6 w-6" />
            Core Wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
