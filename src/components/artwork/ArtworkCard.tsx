"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/contexts/UserContext"
import { useToast } from "@/hooks/use-toast"
import { ExternalLink, ChevronUp, ChevronDown, Lock } from "lucide-react"
import type { Artwork } from "@/types"

interface ArtworkCardProps {
  artwork: Artwork
  onVote: (artworkId: string, voteType: "upvote" | "downvote") => void
  onViewDetails: () => void
  showActions?: boolean
}

export function ArtworkCard({ artwork, onVote, onViewDetails, showActions = true }: ArtworkCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null)
  const { user } = useUser()
  const { toast } = useToast()

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to vote.",
        variant: "destructive",
      })
      return
    }

    if (userVote === voteType) {
      toast({
        title: "Already Voted",
        description: "You have already voted on this artwork.",
        variant: "destructive",
      })
      return
    }

    setIsVoting(true)
    try {
      await onVote(artwork.id, voteType)
      setUserVote(voteType)
      toast({
        title: "Vote Recorded",
        description: `You ${voteType}d this artwork!`,
      })
    } catch (error) {
      toast({
        title: "Vote Failed",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <Card className="artwork-card group">
      <div className="relative aspect-square overflow-hidden rounded-t-xl">
        <Image
          src={artwork.imageUrl || "/placeholder.svg"}
          alt={artwork.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {artwork.isExclusive && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-purple-600 text-white">
              <Lock className="h-3 w-3 mr-1" />
              Exclusive
            </Badge>
          </div>
        )}

        {artwork.price && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {artwork.price} SOL
            </Badge>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button onClick={onViewDetails} variant="secondary" size="sm">
            View Details
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Artist info */}
        <div className="flex items-center space-x-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={artwork.artistAvatar || "/placeholder.svg"} alt={artwork.artistUsername} />
            <AvatarFallback>{artwork.artistUsername.charAt(0)}</AvatarFallback>
          </Avatar>
          <Link
            href={`/profile/${artwork.artistWallet}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            @{artwork.artistUsername}
          </Link>
        </div>

        {/* Artwork info */}
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{artwork.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{artwork.description}</p>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between">
            {/* Voting */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("upvote")}
                disabled={isVoting}
                className={`h-8 px-2 ${userVote === "upvote" ? "text-green-600" : ""}`}
              >
                <ChevronUp className="h-4 w-4" />
                <span className="text-xs ml-1">{artwork.upvotes}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("downvote")}
                disabled={isVoting}
                className={`h-8 px-2 ${userVote === "downvote" ? "text-red-600" : ""}`}
              >
                <ChevronDown className="h-4 w-4" />
                <span className="text-xs ml-1">{artwork.downvotes}</span>
              </Button>

              <span className="text-sm font-medium text-muted-foreground ml-2">
                {artwork.netVotes > 0 ? "+" : ""}
                {artwork.netVotes}
              </span>
            </div>

            {/* External link */}
            {artwork.openseaUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={artwork.openseaUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
