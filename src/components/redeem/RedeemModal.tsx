import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { usePhantomWalletContext } from "@/providers/PhantomWalletProvider";

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RedeemModal({ isOpen, onClose }: RedeemModalProps) {
  const [amount, setAmount] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { user, refreshUser, updateUser } = useUser();
  const { connected, connect } = usePhantomWalletContext();
  const { toast } = useToast();

  const handleRedeem = async () => {
    if (!user?.walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    const redeemAmount = parseInt(amount);
    if (!redeemAmount || redeemAmount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    setIsRedeeming(true);
    try {
      console.log("Starting redemption process...");
      console.log("User wallet:", user.walletAddress);
      console.log("Redeem amount:", redeemAmount);

      // Call backend API to handle the redemption
      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userWallet: user.walletAddress,
          amount: redeemAmount,
        }),
      });

      const result = await response.json();
      console.log("API response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to process redemption");
      }

      // Update user credits manually since we're using mock data
      if (user) {
        const newCredits = Math.max(0, user.credits - redeemAmount);
        const newSolvBalance = user.solvBalance + redeemAmount;

        // Update the user context with new balances
        updateUser({
          credits: newCredits,
          solvBalance: newSolvBalance,
        });
      }

      toast({
        title: "Redemption Successful",
        description: `You have redeemed ${redeemAmount} credits for ${redeemAmount} SOLV tokens. Transaction: ${result.signature}`,
      });

      setAmount("");
      onClose();
    } catch (error) {
      console.error("Redemption failed:", error);
      toast({
        title: "Redemption Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to redeem tokens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleSubmit = async () => {
    if (!connected) {
      try {
        await connect();
      } catch (error) {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to Phantom wallet.",
          variant: "destructive",
        });
        return;
      }
    }

    await handleRedeem();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Redeem Credits</DialogTitle>
          <DialogDescription>
            Convert your credits to SOLV tokens.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-[#9945FF]">
              {user?.credits || 0}
            </span>
            <span className="text-sm text-gray-600">Available Credits</span>
          </div>

          {/* Debug info */}
          <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
            <div>Connected: {connected ? "Yes" : "No"}</div>
            <div>User: {user ? "Loaded" : "Not loaded"}</div>
            <div>Credits: {user?.credits}</div>
            <div>Wallet: {user?.walletAddress || "None"}</div>
            <div>Is Redeeming: {isRedeeming ? "Yes" : "No"}</div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount to Redeem
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              max={user?.credits || 1000}
            />
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">How it works</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Credits can be redeemed for SOLV tokens</li>
              <li>• 1 Credit = 1 SOLV Token</li>
              <li>• Tokens will be sent to your wallet</li>
              <li>• Process is handled securely by our backend</li>
            </ul>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isRedeeming}
            className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white"
          >
            {isRedeeming ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : !connected ? (
              "Connect Wallet"
            ) : (
              "Redeem Tokens"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
