"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
// Import the correct wallet context hook from the provider
import { usePhantomWalletContext } from "@/providers/PhantomWalletProvider";
// Remove the import for the mock WalletContext
// import { useWallet } from "./WalletContext"

interface User {
  walletAddress: string;
  username: string;
  avatar: string;
  isArtist: boolean;
  credits: number;
  solvBalance: number;
  subscriptions: string[];
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  // Use the correct wallet context hook
  const { connected, address: publicKey } = usePhantomWalletContext();

  const refreshUser = async () => {
    if (!connected || !publicKey) {
      setUser(null);
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/users/${publicKey}`)
      // const userData = await response.json()

      // Mock user data for development
      const mockUser: User = {
        walletAddress: publicKey,
        username: "ArtistDemo",
        avatar: "/placeholder.svg?height=100&width=100&query=avatar",
        isArtist: true,
        credits: 1250,
        solvBalance: 45.5,
        subscriptions: [],
      };

      setUser(mockUser);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  useEffect(() => {
    refreshUser();
  }, [connected, publicKey]);

  return (
    <UserContext.Provider value={{ user, loading, updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}
