export interface Artwork {
  id: string
  title: string
  description: string
  imageUrl: string
  artistWallet: string
  artistUsername: string
  artistAvatar: string
  isExclusive: boolean
  price?: number
  upvotes: number
  downvotes: number
  netVotes: number
  createdAt: string
  openseaUrl?: string
  metadataUrl?: string
  mintAddress?: string
}

export interface User {
  walletAddress: string
  username: string
  avatar: string
  isArtist: boolean
  credits: number
  solvBalance: number
  subscriptions: string[]
  totalTipsReceived?: number
  totalArtworks?: number
  joinedAt?: string
}

export interface Tip {
  id: string
  fromWallet: string
  toWallet: string
  amount: number
  currency: "SOL" | "SOLV"
  artworkId?: string
  createdAt: string
}

export interface Subscription {
  id: string
  fanWallet: string
  artistWallet: string
  amount: number
  currency: "SOL" | "SOLV"
  expiresAt: string
  createdAt: string
}

export interface Vote {
  id: string
  walletAddress: string
  artworkId: string
  voteType: "upvote" | "downvote"
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}