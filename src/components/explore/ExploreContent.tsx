"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArtworkCard } from "@/components/artwork/ArtworkCard";
import { ArtworkModal } from "@/components/artwork/ArtworkModal";
import { useUser } from "@/contexts/UserContext";
import { Search, Filter, TrendingUp, Clock } from "lucide-react";
import type { Artwork } from "@/types";

// Mock artwork data
const mockArtworks: Artwork[] = [
  {
    id: "1",
    title: "Digital Dreams",
    description:
      "A vibrant exploration of digital consciousness and virtual reality landscapes.",
    imageUrl:
      "/placeholder.svg?height=400&width=400&query=digital art painting",
    artistWallet: "2Qap48j9Wb4cnDZ7TUFNGxoaMuE6LPi14QTS8MHe5moW",
    artistUsername: "CryptoArtist",
    artistAvatar: "/placeholder.svg?height=50&width=50&query=artist avatar",
    isExclusive: false,
    price: 2.5,
    upvotes: 45,
    downvotes: 3,
    netVotes: 42,
    createdAt: "2024-01-15T10:30:00Z",
    openseaUrl: "https://opensea.io/assets/solana/artwork1",
    mintAddress: "mint123456789",
  },
  {
    id: "2",
    title: "Neon Nights",
    description:
      "Cyberpunk-inspired artwork featuring neon lights and futuristic cityscapes.",
    imageUrl: "/placeholder.svg?height=400&width=400&query=neon cyberpunk art",
    artistWallet: "2Qap48j9Wb4cnDZ7TUFNGxoaMuE6LPi14QTS8MHe5moW",
    artistUsername: "NeonMaster",
    artistAvatar: "/placeholder.svg?height=50&width=50&query=neon artist",
    isExclusive: false,
    price: 1.8,
    upvotes: 38,
    downvotes: 5,
    netVotes: 33,
    createdAt: "2024-01-14T15:45:00Z",
    openseaUrl: "https://opensea.io/assets/solana/artwork2",
  },
  {
    id: "3",
    title: "Abstract Emotions",
    description:
      "An emotional journey through abstract forms and vibrant colors.",
    imageUrl:
      "/placeholder.svg?height=400&width=400&query=abstract emotional art",
    artistWallet: "2Qap48j9Wb4cnDZ7TUFNGxoaMuE6LPi14QTS8MHe5moW",
    artistUsername: "AbstractVibe",
    artistAvatar: "/placeholder.svg?height=50&width=50&query=abstract artist",
    isExclusive: false,
    price: 3.2,
    upvotes: 52,
    downvotes: 2,
    netVotes: 50,
    createdAt: "2024-01-13T09:20:00Z",
    openseaUrl: "https://opensea.io/assets/solana/artwork3",
  },
  {
    id: "4",
    title: "Ocean Depths",
    description:
      "Deep sea exploration through digital art, featuring marine life and underwater scenes.",
    imageUrl:
      "/placeholder.svg?height=400&width=400&query=ocean underwater art",
    artistWallet: "2Qap48j9Wb4cnDZ7TUFNGxoaMuE6LPi14QTS8MHe5moW",
    artistUsername: "OceanDreamer",
    artistAvatar: "/placeholder.svg?height=50&width=50&query=ocean artist",
    isExclusive: false,
    price: 2.1,
    upvotes: 29,
    downvotes: 4,
    netVotes: 25,
    createdAt: "2024-01-12T14:10:00Z",
    openseaUrl: "https://opensea.io/assets/solana/artwork4",
  },
];

export default function ExploreContent() {
  const [artworks, setArtworks] = useState<Artwork[]>(mockArtworks);
  const [filteredArtworks, setFilteredArtworks] =
    useState<Artwork[]>(mockArtworks);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"trending" | "new">("trending");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    fetchArtworks();
  }, [sortBy]);

  useEffect(() => {
    filterArtworks();
  }, [searchQuery, artworks]);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.getArtworks({ sortBy })
      // setArtworks(response.data)

      // Mock sorting
      const sorted = [...mockArtworks].sort((a, b) => {
        if (sortBy === "trending") {
          return b.netVotes - a.netVotes;
        } else {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      });
      setArtworks(sorted);
    } catch (error) {
      console.error("Failed to fetch artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterArtworks = () => {
    if (!searchQuery.trim()) {
      setFilteredArtworks(artworks);
      return;
    }

    const filtered = artworks.filter(
      (artwork) =>
        artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.artistUsername
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredArtworks(filtered);
  };

  const handleVote = async (
    artworkId: string,
    voteType: "upvote" | "downvote"
  ) => {
    if (!user) return;

    try {
      // TODO: Replace with actual API call
      // await apiClient.voteOnArtwork(artworkId, voteType)

      // Mock vote update
      setArtworks((prev) =>
        prev.map((artwork) => {
          if (artwork.id === artworkId) {
            const newUpvotes =
              voteType === "upvote" ? artwork.upvotes + 1 : artwork.upvotes;
            const newDownvotes =
              voteType === "downvote"
                ? artwork.downvotes + 1
                : artwork.downvotes;
            return {
              ...artwork,
              upvotes: newUpvotes,
              downvotes: newDownvotes,
              netVotes: newUpvotes - newDownvotes,
            };
          }
          return artwork;
        })
      );
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Explore Artwork</h1>
          <p className="text-muted-foreground">
            Discover amazing NFT artwork from talented artists
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search artworks, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={sortBy}
          onValueChange={(value: "trending" | "new") => setSortBy(value)}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trending">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </div>
            </SelectItem>
            <SelectItem value="new">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Latest
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Artwork Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="artwork-card animate-pulse">
              <div className="aspect-square bg-muted rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onVote={handleVote}
              onViewDetails={() => setSelectedArtwork(artwork)}
            />
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && filteredArtworks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No artwork found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Artwork Detail Modal */}
      <ArtworkModal
        artwork={selectedArtwork}
        isOpen={!!selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
        onVote={handleVote}
      />
    </div>
  );
}
