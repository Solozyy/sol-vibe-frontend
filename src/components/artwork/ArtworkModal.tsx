"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TipModal } from "@/components/tipping/TipModal";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import {
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Lock,
  Calendar,
  DollarSign,
  Share2,
} from "lucide-react";
import type { Artwork } from "@/types";
import { usePhantomWalletContext } from "@/providers/PhantomWalletProvider";

interface ArtworkModalProps {
  artwork: Artwork | null;
  isOpen: boolean;
  onClose: () => void;
  onVote: (artworkId: string, voteType: "upvote" | "downvote") => void;
}

export function ArtworkModal({
  artwork,
  isOpen,
  onClose,
  onVote,
}: ArtworkModalProps) {
  const [showTipModal, setShowTipModal] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const { user } = useUser();
  const { connected, connect } = usePhantomWalletContext();
  const { toast } = useToast();

  if (!artwork) return null;

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to vote.",
        variant: "destructive",
      });
      return;
    }

    if (userVote === voteType) {
      toast({
        title: "Already Voted",
        description: "You have already voted on this artwork.",
        variant: "destructive",
      });
      return;
    }

    setIsVoting(true);
    try {
      await onVote(artwork.id, voteType);
      setUserVote(voteType);
      toast({
        title: "Vote Recorded",
        description: `You ${voteType}d this artwork!`,
      });
    } catch (error) {
      toast({
        title: "Vote Failed",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: artwork.title,
        text: `Check out "${artwork.title}" by ${artwork.artistUsername} on SolVibe`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Artwork link copied to clipboard!",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-full sm:max-w-[70vw] lg:max-w-[60vw]">
          <DialogHeader>
            <DialogTitle className="sr-only">{artwork.title}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <Image
                src={artwork.imageUrl || "/placeholder.svg"}
                alt={artwork.title}
                fill
                className="object-cover"
              />

              {artwork.isExclusive && (
                <div className="absolute top-4 right-4">
                  <Badge
                    variant="secondary"
                    className="bg-purple-600 text-white"
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Exclusive
                  </Badge>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold mb-2">{artwork.title}</h1>
                <p className="text-muted-foreground">{artwork.description}</p>
              </div>

              {/* Artist */}
              <div className="flex items-center justify-between">
                <Link
                  href={`/profile/${artwork.artistWallet}`}
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={artwork.artistAvatar || "/placeholder.svg"}
                      alt={artwork.artistUsername}
                    />
                    <AvatarFallback>
                      {artwork.artistUsername.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{artwork.artistUsername}</p>
                    <p className="text-sm text-muted-foreground">Artist</p>
                  </div>
                </Link>

                <Button
                  onClick={async () => {
                    if (!window.solana) {
                      window.open("https://phantom.app/", "_blank");
                      return;
                    }
                    if (!connected) {
                      await connect();
                    }
                    setShowTipModal(true);
                  }}
                  className="gradient-button"
                  disabled={
                    !user || user.walletAddress === artwork.artistWallet
                  }
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  {!window.solana
                    ? "Install Phantom"
                    : !connected
                    ? "Connect Wallet"
                    : "Tip Artist"}
                </Button>
              </div>

              <Separator />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {artwork.upvotes}
                  </p>
                  <p className="text-sm text-muted-foreground">Upvotes</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{artwork.netVotes}</p>
                  <p className="text-sm text-muted-foreground">Net Score</p>
                </div>
              </div>

              {/* Voting */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => handleVote("upvote")}
                  disabled={isVoting || !user}
                  className={`flex-1 ${
                    userVote === "upvote"
                      ? "border-green-600 text-green-600"
                      : ""
                  }`}
                >
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Upvote
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleVote("downvote")}
                  disabled={isVoting || !user}
                  className={`flex-1 ${
                    userVote === "downvote" ? "border-red-600 text-red-600" : ""
                  }`}
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Downvote
                </Button>
              </div>

              {/* Metadata */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(artwork.createdAt)}
                  </div>
                </div>

                {artwork.price && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">{artwork.price} SOL</span>
                  </div>
                )}

                {artwork.mintAddress && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Mint Address</span>
                    <span className="font-mono text-xs">
                      {artwork.mintAddress.slice(0, 8)}...
                      {artwork.mintAddress.slice(-8)}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>

                {artwork.openseaUrl && (
                  <Button asChild variant="outline" className="flex-1">
                    <a
                      href={artwork.openseaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      OpenSea
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        recipientWallet={artwork.artistWallet}
        recipientUsername={artwork.artistUsername}
        artworkId={artwork.id}
      />
    </>
  );
}
