"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePhantomWalletContext } from "@/providers/PhantomWalletProvider";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Loader2 } from "lucide-react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

// Add type declaration for window.solana
declare global {
  interface Window {
    solana?: {
      signAndSendTransaction: (
        transaction: Transaction
      ) => Promise<{ signature: string }>;
    };
  }
}

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientWallet: string;
  recipientUsername: string;
  artworkId?: string;
}

export function TipModal({
  isOpen,
  onClose,
  recipientWallet,
  recipientUsername,
  artworkId,
}: TipModalProps) {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { address: walletAddress, connected } = usePhantomWalletContext();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Phantom wallet first.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid tip amount.",
        variant: "destructive",
      });
      return;
    }

    const tipAmount = Number.parseFloat(amount);
    setIsProcessing(true);

    try {
      // Create connection to Solana devnet
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );

      // Create transaction
      const transaction = new Transaction();

      // Add transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletAddress!),
          toPubkey: new PublicKey(recipientWallet),
          lamports: tipAmount * LAMPORTS_PER_SOL,
        })
      );

      // Get latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(walletAddress!);

      // Sign and send transaction
      if (!window.solana) {
        throw new Error("Phantom wallet not found");
      }
      const signed = await window.solana.signAndSendTransaction(transaction);

      // Wait for confirmation
      await connection.confirmTransaction(signed.signature);

      toast({
        title: "Tip Sent Successfully!",
        description: `You tipped ${tipAmount} SOL to ${recipientUsername}`,
      });

      // Reset form and close
      setAmount("");
      onClose();
    } catch (error) {
      console.error("Transfer failed:", error);
      toast({
        title: "Transfer Failed",
        description: "Failed to send tip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setAmount("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5" />
            Send Tip
          </DialogTitle>
          <DialogDescription className="text-sm">
            Send a tip to support {recipientUsername}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient */}
          <div className="flex items-center space-x-3 p-2 bg-muted/50 rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="/placeholder.svg?height=32&width=32&query=avatar"
                alt={recipientUsername}
              />
              <AvatarFallback>
                {recipientUsername.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{recipientUsername}</p>
              <p className="text-xs text-muted-foreground">
                {recipientWallet.slice(0, 8)}...{recipientWallet.slice(-8)}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm">
              Amount (SOL)
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessing}
                className="h-9"
              />
            </div>
          </div>

          {/* Quick amounts */}
          <div className="space-y-2">
            <Label className="text-sm">Quick amounts</Label>
            <div className="grid grid-cols-4 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount("0.1")}
                disabled={isProcessing}
                className="h-8 text-sm"
              >
                0.1
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount("0.5")}
                disabled={isProcessing}
                className="h-8 text-sm"
              >
                0.5
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount("1")}
                disabled={isProcessing}
                className="h-8 text-sm"
              >
                1
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount("5")}
                disabled={isProcessing}
                className="h-8 text-sm"
              >
                5
              </Button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 h-9 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isProcessing || !amount || Number.parseFloat(amount) <= 0
              }
              className="flex-1 h-9 text-sm gradient-button"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                `Send ${amount || "0"} SOL`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
