"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Upload, Loader2 } from "lucide-react"
import type { User } from "@/types"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentProfile: User
  onProfileUpdate: (updatedProfile: User) => void
}

export function EditProfileModal({ isOpen, onClose, currentProfile, onProfileUpdate }: EditProfileModalProps) {
  const [username, setUsername] = useState(currentProfile.username)
  const [avatar, setAvatar] = useState(currentProfile.avatar)
  const [isArtist, setIsArtist] = useState(currentProfile.isArtist)
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const { toast } = useToast()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setAvatarFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatar(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // TODO: Replace with actual API call
      // const formData = new FormData()
      // formData.append('username', username)
      // formData.append('isArtist', isArtist.toString())
      // if (avatarFile) {
      //   formData.append('avatar', avatarFile)
      // }
      //
      // const response = await apiClient.updateProfile(formData)

      // Mock successful update
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedProfile: User = {
        ...currentProfile,
        username,
        avatar,
        isArtist,
      }

      onProfileUpdate(updatedProfile)

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setUsername(currentProfile.username)
      setAvatar(currentProfile.avatar)
      setIsArtist(currentProfile.isArtist)
      setAvatarFile(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information and settings.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatar || "/placeholder.svg"} alt="Profile avatar" />
              <AvatarFallback className="text-lg">{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div>
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Change Avatar
                  </span>
                </Button>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Artist toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="artist-toggle">Artist Account</Label>
              <p className="text-sm text-muted-foreground">
                Enable artist features like creating NFTs and exclusive content
              </p>
            </div>
            <Switch id="artist-toggle" checked={isArtist} onCheckedChange={setIsArtist} disabled={isLoading} />
          </div>

          {/* Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 gradient-button">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
