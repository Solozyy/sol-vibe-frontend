"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArtworkCard } from "@/components/artwork/ArtworkCard"
import { ArtworkModal } from "@/components/artwork/ArtworkModal"
import { TipModal } from "@/components/tipping/TipModal"
import { SubscriptionModal } from "@/components/subscription/SubscriptionModal"
import { EditProfileModal } from "@/components/profile/EditProfileModal"
import { useUser } from "@/contexts/UserContext"
import { useWallet } from "@/contexts/WalletContext"
import { useToast } from "@/hooks/use-toast"
import { DollarSign, Users, Palette, Star, Settings, Copy, Calendar, Coins } from "lucide-react"
import type { Artwork, User } from "@/types"

interface ProfileContentProps {
  walletAddress: string
}

// Mock profile data
const mockProfileData: User = {
  walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  username: "CryptoArtist",
  avatar: "/placeholder.svg?height=120&width=120&query=artist avatar",
  isArtist: true,
  credits: 1250,
  solvBalance: 45.5,
  subscriptions: [],
  totalTipsReceived: 125.8,
  totalArtworks: 24,
  joinedAt: "2024-01-01T00:00:00Z",
}

const mockArtworks: Artwork[] = [
  {
    id: "1",
    title: "Digital Dreams",
    description: "A vibrant exploration of digital consciousness",
    imageUrl: "/placeholder.svg?height=400&width=400&query=digital art",
    artistWallet: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    artistUsername: "CryptoArtist",
    artistAvatar: "/placeholder.svg?height=50&width=50&query=artist",
    isExclusive: false,
    price: 2.5,
    upvotes: 45,
    downvotes: 3,
    netVotes: 42,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    title: "Exclusive Masterpiece",
    description: "Premium artwork for subscribers only",
    imageUrl: "/placeholder.svg?height=400&width=400&query=exclusive art",
    artistWallet: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    artistUsername: "CryptoArtist",
    artistAvatar: "/placeholder.svg?height=50&width=50&query=artist",
    isExclusive: true,
    price: 5.0,
    upvotes: 28,
    downvotes: 1,
    netVotes: 27,
    createdAt: "2024-01-10T14:20:00Z",
  },
]

export default function ProfileContent({ walletAddress }: ProfileContentProps) {
  const [profileData, setProfileData] = useState<User | null>(null)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [exclusiveArtworks, setExclusiveArtworks] = useState<Artwork[]>([])
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [showTipModal, setShowTipModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)

  const { user: currentUser } = useUser()
  const { publicKey } = useWallet()
  const { toast } = useToast()

  const isOwnProfile = publicKey === walletAddress

  useEffect(() => {
    fetchProfileData()
  }, [walletAddress])

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API calls
      // const profileResponse = await apiClient.getUserProfile(walletAddress)
      // const artworksResponse = await apiClient.getArtworks({ artistWallet: walletAddress })

      setProfileData(mockProfileData)
      setArtworks(mockArtworks.filter((a) => !a.isExclusive))
      setExclusiveArtworks(mockArtworks.filter((a) => a.isExclusive))

      // Check subscription status
      setIsSubscribed(currentUser?.subscriptions?.includes(walletAddress) || false)
    } catch (error) {
      console.error("Failed to fetch profile data:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (artworkId: string, voteType: "upvote" | "downvote") => {
    // Implementation from ArtworkCard
    console.log("Vote:", artworkId, voteType)
  }

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard.",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-4" />
          <div className="h-8 bg-muted rounded w-1/3 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground">This user profile does not exist.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Avatar and basic info */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt={profileData.username} />
                  <AvatarFallback className="text-2xl">{profileData.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold mb-1">{profileData.username}</h1>
                  <div className="flex items-center gap-2 mb-2">
                    {profileData.isArtist && (
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      >
                        <Palette className="h-3 w-3 mr-1" />
                        Artist
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <button
                      onClick={copyWalletAddress}
                      className="flex items-center hover:text-foreground transition-colors"
                    >
                      <span className="font-mono">
                        {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                      </span>
                      <Copy className="h-3 w-3 ml-1" />
                    </button>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {formatDate(profileData.joinedAt || "")}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {profileData.isArtist && (
                    <>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">{profileData.totalArtworks}</p>
                        <p className="text-sm text-muted-foreground">Artworks</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">{profileData.totalTipsReceived?.toFixed(1)}</p>
                        <p className="text-sm text-muted-foreground">SOL Received</p>
                      </div>
                    </>
                  )}
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{profileData.credits}</p>
                    <p className="text-sm text-muted-foreground">Credits</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{profileData.solvBalance}</p>
                    <p className="text-sm text-muted-foreground">SOLV</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  {isOwnProfile ? (
                    <Button onClick={() => setShowEditModal(true)} variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button onClick={() => setShowTipModal(true)} className="gradient-button">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Tip Artist
                      </Button>

                      {profileData.isArtist && (
                        <Button
                          onClick={() => setShowSubscriptionModal(true)}
                          variant={isSubscribed ? "secondary" : "outline"}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          {isSubscribed ? "Subscribed" : "Subscribe"}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="artworks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="artworks">My Artwork</TabsTrigger>
            {profileData.isArtist && <TabsTrigger value="exclusive">Exclusive Content</TabsTrigger>}
            {!profileData.isArtist && <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>}
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Public Artworks */}
          <TabsContent value="artworks" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Public Artwork</h2>
              <span className="text-sm text-muted-foreground">
                {artworks.length} artwork{artworks.length !== 1 ? "s" : ""}
              </span>
            </div>

            {artworks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((artwork) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    onVote={handleVote}
                    onViewDetails={() => setSelectedArtwork(artwork)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Palette className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No artwork yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "Start creating your first NFT!" : "This artist hasn't published any artwork yet."}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Exclusive Content */}
          {profileData.isArtist && (
            <TabsContent value="exclusive" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Exclusive Content</h2>
                <span className="text-sm text-muted-foreground">
                  {exclusiveArtworks.length} exclusive artwork{exclusiveArtworks.length !== 1 ? "s" : ""}
                </span>
              </div>

              {!isOwnProfile && !isSubscribed ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="blur-content mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exclusiveArtworks.map((artwork) => (
                          <ArtworkCard
                            key={artwork.id}
                            artwork={artwork}
                            onVote={handleVote}
                            onViewDetails={() => {}}
                            showActions={false}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Exclusive Content</h3>
                      <p className="text-muted-foreground">
                        Subscribe to {profileData.username} to access their exclusive artwork and content.
                      </p>
                      <Button onClick={() => setShowSubscriptionModal(true)} className="gradient-button">
                        <Users className="h-4 w-4 mr-2" />
                        Subscribe to View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : exclusiveArtworks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exclusiveArtworks.map((artwork) => (
                    <ArtworkCard
                      key={artwork.id}
                      artwork={artwork}
                      onVote={handleVote}
                      onViewDetails={() => setSelectedArtwork(artwork)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No exclusive content yet</h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile
                      ? "Create exclusive content for your subscribers!"
                      : "This artist hasn't created exclusive content yet."}
                  </p>
                </div>
              )}
            </TabsContent>
          )}

          {/* Subscriptions (for fans) */}
          {!profileData.isArtist && (
            <TabsContent value="subscriptions" className="space-y-4">
              <h2 className="text-xl font-semibold">My Subscriptions</h2>
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No subscriptions yet</h3>
                <p className="text-muted-foreground">Subscribe to artists to access their exclusive content.</p>
              </div>
            </TabsContent>
          )}

          {/* Activity */}
          <TabsContent value="activity" className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <div className="text-center py-12">
              <div className="h-12 w-12 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Coins className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
              <p className="text-muted-foreground">Activity will appear here as you interact with the platform.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <ArtworkModal
        artwork={selectedArtwork}
        isOpen={!!selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
        onVote={handleVote}
      />

      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        recipientWallet={walletAddress}
        recipientUsername={profileData.username}
      />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        artistWallet={walletAddress}
        artistUsername={profileData.username}
        isSubscribed={isSubscribed}
        onSubscriptionChange={setIsSubscribed}
      />

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentProfile={profileData}
        onProfileUpdate={(updatedProfile) => {
          setProfileData(updatedProfile)
          setShowEditModal(false)
        }}
      />
    </>
  )
}
