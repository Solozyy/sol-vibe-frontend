"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

// Mock wallet adapter types for development
interface WalletAdapter {
  publicKey: string | null
  connected: boolean
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
}

interface WalletContextType {
  wallet: WalletAdapter | null
  connected: boolean
  connecting: boolean
  publicKey: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signMessage: (message: string) => Promise<string>
  balance: number
}

const WalletContext = createContext<WalletContextType | null>(null)

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)

  // Mock wallet implementation for development
  const mockWallet: WalletAdapter = {
    publicKey,
    connected,
    connecting,
    connect: async () => {
      setConnecting(true)
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setConnected(true)
      setPublicKey("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM") // Mock public key
      setBalance(2.5) // Mock balance
      setConnecting(false)
    },
    disconnect: async () => {
      setConnected(false)
      setPublicKey(null)
      setBalance(0)
    },
    signMessage: async (message: Uint8Array) => {
      // Mock signature
      return new Uint8Array(64)
    },
  }

  const connect = async () => {
    try {
      await mockWallet.connect()
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      setConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      await mockWallet.disconnect()
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  const signMessage = async (message: string): Promise<string> => {
    const encodedMessage = new TextEncoder().encode(message)
    await mockWallet.signMessage(encodedMessage)
    return "mock_signature_" + Date.now()
  }

  return (
    <WalletContext.Provider
      value={{
        wallet: mockWallet,
        connected,
        connecting,
        publicKey,
        connect,
        disconnect,
        signMessage,
        balance,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
