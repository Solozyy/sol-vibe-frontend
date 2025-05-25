"use client";

import {
  Edit,
  Copy,
  ExternalLink,
  Award,
  TrendingUp,
  Coins,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Import mock data for now - should be replaced with real data from API
const userContent = [
  {
    id: "1",
    title: "My First NFT",
    creator: "your.wallet",
    upvotes: 123,
    image: "/placeholder.svg?height=300&width=400&query=first nft creation",
    type: "image" as const,
    price: "2.0 SOL",
  },
  {
    id: "2",
    title: "Solana Tutorial",
    creator: "your.wallet",
    upvotes: 89,
    image: "/placeholder.svg?height=300&width=400&query=solana tutorial video",
    type: "video" as const,
    price: "1.5 SOL",
  },
];

export function ProfileHeader() {
  const { user } = useUser();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (!user?.walletAddress) return;

    try {
      await navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });

      // Reset copy icon after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to Copy",
        description: "Please try copying manually",
        variant: "destructive",
      });
    }
  };

  const handleExternalLink = () => {
    if (!user?.walletAddress) return;
    window.open(`https://solscan.io/account/${user.walletAddress}`, "_blank");
  };

  if (!user) return null;

  // Get initials from username or wallet address
  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : user.walletAddress.slice(0, 2).toUpperCase();

  // Format wallet address for display
  const displayAddress =
    user.walletAddress.slice(0, 4) + "..." + user.walletAddress.slice(-4);

  return (
    <div className="mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.username || displayAddress}
                </h1>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit Profile
                </Button>
              </div>

              <div className="flex items-center space-x-2 text-gray-600 mb-4">
                <span className="font-mono text-sm">{displayAddress}</span>
                <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleExternalLink}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-gray-700 mb-4">
                Digital creator exploring the intersection of art and blockchain
                technology. Building the future of decentralized content.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-[#9945FF] font-semibold">
                    <Award className="w-4 h-4" />
                    <span>{user.credits}</span>
                  </div>
                  <p className="text-xs text-gray-600">Available Credits</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-[#14F195] font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span>{user.solvBalance}</span>
                  </div>
                  <p className="text-xs text-gray-600">SOLV Balance</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-[#9945FF] font-semibold">
                    <Coins className="w-4 h-4" />
                    <span>{user.isArtist ? "Artist" : "Collector"}</span>
                  </div>
                  <p className="text-xs text-gray-600">Account Type</p>
                </div>

                <div className="text-center">
                  <div className="text-[#14F195] font-semibold">
                    {userContent.length || 0}
                  </div>
                  <p className="text-xs text-gray-600">NFTs Created</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
