"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePhantomWalletContext } from "@/providers/PhantomWalletProvider";
import type { WalletInfo } from "@/hooks/usePhantomWallet";
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

const API_BASE_URL = 'http://localhost:3000';

// Types based on OpenAPI spec
interface User {
  id: string;
  walletAddress: string;
  username: string;
  name: string;
  bio?: string;
  // Add other fields if present in your User schema / API responses
  profileImage?: string; 
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  connectAndLogin: () => Promise<void>;
  logout: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  isProfileModalOpen: boolean;
  walletAddress: string | null;
  isWalletConnected: boolean;
  walletSignMessage: ((message: Uint8Array) => Promise<Uint8Array>) | undefined;
  walletConnect: () => Promise<void>;
  walletDisconnect: () => Promise<void>;
  login: (userData: User, newToken: string) => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_STORAGE_KEY = 'solVibe_authToken';
const USER_STORAGE_KEY = 'solVibe_authUser';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const {
    address: currentWalletAddress,
    connected: isWalletCurrentlyConnected,
    signMessage: phantomSignMessage,
    connect: phantomConnect,
    disconnect: phantomDisconnect,
  } = usePhantomWalletContext();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const clearAuthState = () => {
    setUser(null);
    setToken(null);
    setError(null);
    setIsLoading(false);
  };

  const login = useCallback((userData: User, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    setIsLoading(false);
    setError(null);
    console.log("User logged in, token and user stored:", newToken, userData);
  }, []);

  const handleApiError = (message: string, err?: any) => {
    console.error(message, err);
    setError(message);
    setIsLoading(false);
  };

  const performSignAndVerify = async (walletAddr: string, messageToSign: string) => {
    if (!phantomSignMessage) {
      handleApiError('Wallet does not support signMessage');
      return;
    }

    try {
      const encodedMessage = new TextEncoder().encode(messageToSign);
      const { signature: signatureBytes } = await phantomSignMessage(encodedMessage, 'utf8');
      const signature = bs58.encode(signatureBytes);

      const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletAddr, message: messageToSign, signature }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || 'Verification failed');
      }

      login(verifyData.user, verifyData.accessToken);
      closeProfileModal();
    } catch (err) {
      handleApiError('Failed to sign or verify message.', err);
    }
  };

  const connectAndLogin = useCallback(async () => {
    if (!isWalletCurrentlyConnected) {
      try {
        await phantomConnect();
      } catch (e) {
        handleApiError('Failed to connect wallet.', e);
        return;
      }
    }
  }, [isWalletCurrentlyConnected, phantomConnect]);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUserString = localStorage.getItem(USER_STORAGE_KEY);

      if (storedToken && storedUserString) {
        const storedUser: User = JSON.parse(storedUserString);
        setToken(storedToken);
        setUser(storedUser);
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to check auth status:", error);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const logout = async () => {
    if (isWalletCurrentlyConnected) {
      try {
        await phantomDisconnect();
      } catch (e) {
        console.error("Failed to disconnect wallet", e);
      }
    }
    clearAuthState();
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };
  
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    if (isLoading && !user) { 
        setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        error,
        connectAndLogin,
        logout,
        openProfileModal,
        closeProfileModal,
        isProfileModalOpen,
        walletAddress: currentWalletAddress,
        isWalletConnected: isWalletCurrentlyConnected,
        walletSignMessage: phantomSignMessage 
          ? async (message: Uint8Array) => (await phantomSignMessage(message, 'utf8')).signature 
          : undefined,
        walletConnect: phantomConnect,
        walletDisconnect: phantomDisconnect,
        login,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to get base URL (can be enhanced for different environments)
// function getApiBaseUrl() {
//   if (process.env.NEXT_PUBLIC_API_URL) {
//     return process.env.NEXT_PUBLIC_API_URL;
//   }
//   return 'http://localhost:3000'; // Default for local development
// }
// const API_BASE_URL = getApiBaseUrl(); 