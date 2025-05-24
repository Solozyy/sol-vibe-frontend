"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/contexts/WalletContext"
import { useUser } from "@/contexts/UserContext"
import { useToast } from "@/hooks/use-toast"
import { Users, Star, Check, Loader2, Crown } from "lucide-react"

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  artistWallet: string
  artistUsername: string
  isSubscribed: boolean
  onSubscriptionChange: (subscribed: boolean) => void
}

const subscriptionTiers = [
  {
    id: "basic",
    name: "Basic",
    price: 0.1,
    currency: "SOL",
    duration: "month",
    features: ["Access to exclusive artwork", "Early access to new releases", "Direct messaging with artist"],
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 50,
    currency: "SOLV",
    duration: "month",
    features: ["All Basic features", "Behind-the-scenes content", "Monthly video calls", "Custom artwork requests"],
    popular: true,
  },
  {
    id: "vip",
    name: "VIP",
    price: 0.5,
    currency: "SOL",
    duration: "month",
    features: [
      "All Premium features",
      "1-on-1 mentorship sessions",
      "Physical artwork prints",
      "Co-creation opportunities",
    ],
    popular: false,
  },
]

export function SubscriptionModal({
  isOpen,
  onClose,
  artistWallet,
  artistUsername,
  isSubscribed,
  onSubscriptionChange,
}: SubscriptionModalProps) {
  const [selectedTier, setSelectedTier] = useState(subscriptionTiers[0])
  const [isProcessing, setIsProcessing] = useState(false)

  const { balance } = useWallet()
  const { user } = useUser()
  const { toast } = useToast()

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to subscribe.",
        variant: "destructive",
      })
      return
    }

    // Check balance
    if (selectedTier.currency === "SOL" && selectedTier.price > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough SOL for this subscription.",
        variant: "destructive",
      })
      return
    }

    if (selectedTier.currency === "SOLV" && selectedTier.price > (user.solvBalance || 0)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough SOLV for this subscription.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // TODO: Replace with actual API call
      // await apiClient.subscribe({
      //   artistWallet,
      //   amount: selectedTier.price,
      //   currency: selectedTier.currency
      // })

      // Mock successful subscription
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Subscription Activated!",
        description: `You're now subscribed to ${artistUsername}'s ${selectedTier.name} tier.`,
      })

      onSubscriptionChange(true)
      onClose()
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "Failed to activate subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnsubscribe = async () => {
    setIsProcessing(true)

    try {
      // TODO: Replace with actual API call
      // await apiClient.unsubscribe(artistWallet)

      // Mock successful unsubscription
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Unsubscribed",
        description: `You've unsubscribed from ${artistUsername}.`,
      })

      onSubscriptionChange(false)
      onClose()
    } catch (error) {
      toast({
        title: "Unsubscribe Failed",
        description: "Failed to unsubscribe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isSubscribed ? "Manage Subscription" : "Subscribe to Artist"}
          </DialogTitle>
          <DialogDescription>
            {isSubscribed
              ? `You're currently subscribed to ${artistUsername}`
              : `Choose a subscription tier to access ${artistUsername}'s exclusive content`}
          </DialogDescription>
        </DialogHeader>

        {/* Artist info */}
        <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg?height=48&width=48&query=artist" alt={artistUsername} />
            <AvatarFallback>{artistUsername.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{artistUsername}</p>
            <p className="text-sm text-muted-foreground">Digital Artist</p>
          </div>
        </div>

        {isSubscribed ? (
          /* Current subscription */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Active Subscription
              </CardTitle>
              <CardDescription>You have access to all exclusive content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Current Plan</span>
                  <Badge variant="secondary">Basic - 0.1 SOL/month</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Next Billing</span>
                  <span className="text-sm text-muted-foreground">February 15, 2024</span>
                </div>
                <Button onClick={handleUnsubscribe} disabled={isProcessing} variant="destructive" className="w-full">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Unsubscribing...
                    </>
                  ) : (
                    "Unsubscribe"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Subscription tiers */
          <div className="space-y-4">
            <h3 className="font-semibold">Choose Your Subscription Tier</h3>

            <div className="grid gap-4">
              {subscriptionTiers.map((tier) => (
                <Card
                  key={tier.id}
                  className={`cursor-pointer transition-all ${
                    selectedTier.id === tier.id
                      ? "ring-2 ring-purple-600 border-purple-600"
                      : "hover:border-purple-600/50"
                  } ${tier.popular ? "relative" : ""}`}
                  onClick={() => setSelectedTier(tier)}
                >
                  {tier.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white">
                        <Crown className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {tier.price} {tier.currency}
                        </div>
                        <div className="text-sm text-muted-foreground">per {tier.duration}</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Balance info */}
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <div className="flex justify-between">
                <span>Your SOL Balance:</span>
                <span>{balance.toFixed(4)} SOL</span>
              </div>
              <div className="flex justify-between">
                <span>Your SOLV Balance:</span>
                <span>{(user?.solvBalance || 0).toFixed(2)} SOLV</span>
              </div>
            </div>

            {/* Subscribe button */}
            <Button onClick={handleSubscribe} disabled={isProcessing} className="w-full gradient-button" size="lg">
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Subscribe for {selectedTier.price} {selectedTier.currency}/{selectedTier.duration}
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
