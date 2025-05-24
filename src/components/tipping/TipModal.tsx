"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useWallet } from "@/contexts/WalletContext"
import { useUser } from "@/contexts/UserContext"
import { useToast } from "@/hooks/use-toast"
import { DollarSign, Loader2 } from "lucide-react"

interface TipModalProps {
  isOpen: boolean
  onClose: () => void
  recipientWallet: string
  recipientUsername: string
  artworkId?: string
}

export function TipModal({ isOpen, onClose, recipientWallet, recipientUsername, artworkId }: TipModalProps) {
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<"SOL" | "SOLV">("SOL")
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState("")

  const { balance } = useWallet()
  const { user } = useUser()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid tip amount.",
        variant: "destructive",
      })
      return
    }

    const tipAmount = Number.parseFloat(amount)

    // Check balance
    if (currency === "SOL" && tipAmount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough SOL for this tip.",
        variant: "destructive",
      })
      return
    }

    if (currency === "SOLV" && tipAmount > (user?.solvBalance || 0)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough SOLV for this tip.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // TODO: Replace with actual API call
      // await apiClient.sendTip({
      //   toWallet: recipientWallet,
      //   amount: tipAmount,
      //   currency,
      //   artworkId
      // })

      // Mock successful tip
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Tip Sent Successfully!",
        description: `You tipped ${tipAmount} ${currency} to ${recipientUsername}`,
      })

      // Reset form
      setAmount("")
      setMessage("")
      onClose()
    } catch (error) {
      toast({
        title: "Tip Failed",
        description: "Failed to send tip. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      setAmount("")
      setMessage("")
      onClose()
    }
  }

  const getMaxAmount = () => {
    return currency === "SOL" ? balance : user?.solvBalance || 0
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Send Tip
          </DialogTitle>
          <DialogDescription>Send a tip to support {recipientUsername}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient */}
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40&query=avatar" alt={recipientUsername} />
              <AvatarFallback>{recipientUsername.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{recipientUsername}</p>
              <p className="text-sm text-muted-foreground">
                {recipientWallet.slice(0, 8)}...{recipientWallet.slice(-8)}
              </p>
            </div>
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={(value: "SOL" | "SOLV") => setCurrency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOL">
                  <div className="flex items-center justify-between w-full">
                    <span>SOL</span>
                    <span className="text-sm text-muted-foreground ml-2">Balance: {balance.toFixed(4)}</span>
                  </div>
                </SelectItem>
                <SelectItem value="SOLV">
                  <div className="flex items-center justify-between w-full">
                    <span>SOLV</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Balance: {(user?.solvBalance || 0).toFixed(2)}
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={getMaxAmount()}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessing}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                {currency}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: 0.01 {currency}</span>
              <span>
                Max: {getMaxAmount().toFixed(currency === "SOL" ? 4 : 2)} {currency}
              </span>
            </div>
          </div>

          {/* Quick amounts */}
          <div className="space-y-2">
            <Label>Quick amounts</Label>
            <div className="grid grid-cols-4 gap-2">
              {currency === "SOL" ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount("0.1")}
                    disabled={isProcessing}
                  >
                    0.1
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount("0.5")}
                    disabled={isProcessing}
                  >
                    0.5
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount("1")}
                    disabled={isProcessing}
                  >
                    1
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount("5")}
                    disabled={isProcessing}
                  >
                    5
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount("10")}
                    disabled={isProcessing}
                  >
                    10
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount("25")}
                    disabled={isProcessing}
                  >
                    25
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount("50")}
                    disabled={isProcessing}
                  >
                    50
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount("100")}
                    disabled={isProcessing}
                  >
                    100
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Input
              id="message"
              placeholder="Add a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {/* Submit */}
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isProcessing} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing || !amount || Number.parseFloat(amount) <= 0}
              className="flex-1 gradient-button"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                `Send ${amount || "0"} ${currency}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
