import { useState, useEffect, useCallback } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  authControllerCheckWallet,
  // authControllerRequestSignatureMessage, // Potentially needed for login flow
  // authControllerVerify, // Potentially needed for login flow
} from "@/services/apiService"; // Import the new API service
import type { CheckWalletDto } from "@/types/api"; // Import DTO

export interface PhantomWindow extends Window {
  solana?: {
    isPhantom?: boolean;
    connect: (params?: {
      onlyIfTrusted?: boolean;
    }) => Promise<{ publicKey: PublicKey }>;
    disconnect: () => Promise<void>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    publicKey: PublicKey | null;
    isConnected: boolean;
    signMessage: (
      message: Uint8Array,
      encoding: string
    ) => Promise<{ signature: Uint8Array; publicKey: PublicKey }>;
  };
}

declare const window: PhantomWindow;

export interface WalletInfo {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  walletExists: boolean;
  showProfileSetup: boolean;
}

// Local storage keys
const WALLET_CONNECTION_KEY = "solVibe_wallet_connected";
const WALLET_ADDRESS_KEY = "solVibe_wallet_address";
const PROFILE_SETUP_KEY = "solVibe_profile_completed";

export const usePhantomWallet = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    address: null,
    connected: false,
    connecting: false,
    walletExists: false,
    showProfileSetup: false,
  });

  // Initialize profile status from localStorage
  const [profileCompleted, setProfileCompleted] = useState(() => {
    if (typeof window !== "undefined") {
      // We will rely on API check rather than local storage for profile completion status initially
      // return localStorage.getItem(PROFILE_SETUP_KEY) === "true";
    }
    return false;
  });

  // Function to check if user profile exists in backend
  const checkUserProfileExists = useCallback(
    async (walletAddress: string): Promise<boolean> => {
      console.log("Checking if profile exists for wallet via API:", walletAddress);
      try {
        const payload: CheckWalletDto = { walletAddress };
        const response = await authControllerCheckWallet(payload);
        console.log("API checkUserProfileExists response:", response);
        if (response.exists && response.user) {
          // User exists, profile is considered completed
          localStorage.setItem(PROFILE_SETUP_KEY, "true"); // Update local storage for consistency
          setProfileCompleted(true);
          return true;
        }
        // User does not exist or no user data returned
        localStorage.removeItem(PROFILE_SETUP_KEY); // Clear local storage
        setProfileCompleted(false);
        return false;
      } catch (error) {
        console.error("Error checking profile from API:", error);
        localStorage.removeItem(PROFILE_SETUP_KEY); // Clear on error as well
        setProfileCompleted(false);
        return false; // Assume profile does not exist or error occurred
      }
    },
    []
  );

  // Show profile setup modal if needed after wallet connection
  const showProfileSetupIfNeeded = useCallback(
    async (walletAddress: string) => {
      try {
        // Check if user profile already exists
        const profileExists = await checkUserProfileExists(walletAddress);

        // Only show profile setup if profile doesn't exist
        if (!profileExists) {
          setWalletInfo((prev) => ({ ...prev, showProfileSetup: true }));
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      }
    },
    [checkUserProfileExists]
  );

  // Auto-reconnect on page load
  const autoReconnect = useCallback(async () => {
    // Only try to reconnect if we have a stored connection
    if (
      typeof window !== "undefined" &&
      localStorage.getItem(WALLET_CONNECTION_KEY) === "true" &&
      window.solana?.isPhantom
    ) {
      try {
        // If the wallet is already connected, get the public key
        if (window.solana.isConnected && window.solana.publicKey) {
          const address = window.solana.publicKey.toString();

          setWalletInfo((prev) => ({
            ...prev,
            address,
            connected: true,
            walletExists: true,
            // Don't show profile setup yet - we'll check if needed
          }));

          // Store connection info
          localStorage.setItem(WALLET_CONNECTION_KEY, "true");
          localStorage.setItem(WALLET_ADDRESS_KEY, address);

          // Check if we need to show profile setup
          await showProfileSetupIfNeeded(address);

          return;
        }

        // Otherwise try to reconnect with onlyIfTrusted to avoid popup
        setWalletInfo((prev) => ({ ...prev, connecting: true }));
        const { publicKey } = await window.solana.connect({
          onlyIfTrusted: true,
        });

        const address = publicKey.toString();
        setWalletInfo((prev) => ({
          ...prev,
          address,
          connected: true,
          connecting: false,
          walletExists: true,
          // Don't show profile setup yet - we'll check if needed
        }));

        // Store connection info
        localStorage.setItem(WALLET_CONNECTION_KEY, "true");
        localStorage.setItem(WALLET_ADDRESS_KEY, address);

        // Check if we need to show profile setup
        await showProfileSetupIfNeeded(address);
      } catch (error) {
        // Auto-reconnect failed, clear stored data
        console.log("Auto-reconnect failed", error);
        localStorage.removeItem(WALLET_CONNECTION_KEY);
        localStorage.removeItem(WALLET_ADDRESS_KEY);

        setWalletInfo((prev) => ({
          ...prev,
          connecting: false,
          connected: false,
          address: null,
        }));
      }
    }
  }, [showProfileSetupIfNeeded]);

  // Check if Phantom is installed and try to reconnect
  useEffect(() => {
    const checkWalletExists = () => {
      const walletExists = window?.solana?.isPhantom || false;
      setWalletInfo((prev) => ({ ...prev, walletExists }));

      if (walletExists) {
        // Try to auto-reconnect
        autoReconnect();
      }
    };

    checkWalletExists();

    // Listen for account changes
    if (window.solana) {
      window.solana.on("accountChanged", (publicKey: PublicKey | null) => {
        if (publicKey) {
          const address = publicKey.toString();
          setWalletInfo((prev) => ({
            ...prev,
            address,
            connected: true,
          }));
          localStorage.setItem(WALLET_ADDRESS_KEY, address);
          // When account changes, re-check profile status
          checkUserProfileExists(address).then((exists) => {
            setWalletInfo((prev) => ({ ...prev, showProfileSetup: !exists }));
          });
        } else {
          // Wallet disconnected or changed to a locked state
          setWalletInfo((prev) => ({
            ...prev,
            address: null,
            connected: false,
            showProfileSetup: false, // Reset on disconnect
          }));
          localStorage.removeItem(WALLET_CONNECTION_KEY);
          localStorage.removeItem(WALLET_ADDRESS_KEY);
          localStorage.removeItem(PROFILE_SETUP_KEY); // Clear profile status
          setProfileCompleted(false); // Reset profile completed state
        }
      });

      // Listen for connection events
      window.solana.on("connect", async (publicKey: PublicKey) => {
        const address = publicKey.toString();
        const profileExists = await checkUserProfileExists(address);

        setWalletInfo((prev) => ({
          ...prev,
          address,
          connected: true,
          connecting: false,
          showProfileSetup: !profileExists,
        }));
        localStorage.setItem(WALLET_CONNECTION_KEY, "true");
        localStorage.setItem(WALLET_ADDRESS_KEY, address);
        // setProfileCompleted is handled by checkUserProfileExists
      });

      window.solana.on("disconnect", () => {
        setWalletInfo((prev) => ({
          ...prev,
          address: null,
          connected: false,
          connecting: false,
          showProfileSetup: false,
        }));
        localStorage.removeItem(WALLET_CONNECTION_KEY);
        localStorage.removeItem(WALLET_ADDRESS_KEY);
        localStorage.removeItem(PROFILE_SETUP_KEY); // Clear profile status
        setProfileCompleted(false); // Reset profile completed state
      });
    }
  }, [autoReconnect, profileCompleted]);

  // Connect to Phantom wallet
  const connect = useCallback(async () => {
    if (!window.solana) {
      // Phantom is not installed
      window.open("https://phantom.app/", "_blank");
      return;
    }

    try {
      setWalletInfo((prev) => ({ ...prev, connecting: true }));
      const { publicKey } = await window.solana.connect();
      const address = publicKey.toString();

      // After connecting, check if the profile exists
      const profileExists = await checkUserProfileExists(address);

      setWalletInfo({
        address,
        connected: true,
        connecting: false,
        walletExists: true,
        showProfileSetup: !profileExists, // Show setup if profile doesn't exist
      });

      localStorage.setItem(WALLET_CONNECTION_KEY, "true");
      localStorage.setItem(WALLET_ADDRESS_KEY, address);
      // setProfileCompleted is handled by checkUserProfileExists
    } catch (error) {
      console.error("Failed to connect to Phantom wallet:", error);
      setWalletInfo((prev) => ({ ...prev, connecting: false }));

      // Clear stored data in case of error
      localStorage.removeItem(WALLET_CONNECTION_KEY);
      localStorage.removeItem(WALLET_ADDRESS_KEY);
    }
  }, [checkUserProfileExists]);

  // Disconnect from Phantom wallet
  const disconnect = useCallback(async () => {
    if (window.solana) {
      try {
        await window.solana.disconnect();
        setWalletInfo({
          address: null,
          connected: false,
          connecting: false,
          walletExists: true,
          showProfileSetup: false,
        });

        // Clear stored data
        localStorage.removeItem(WALLET_CONNECTION_KEY);
        localStorage.removeItem(WALLET_ADDRESS_KEY);
      } catch (error) {
        console.error("Failed to disconnect from Phantom wallet:", error);
      }
    }
  }, []);

  // Close profile setup modal and mark as completed
  const closeProfileSetup = useCallback(() => {
    setWalletInfo((prev) => ({ ...prev, showProfileSetup: false }));
  }, []);

  // Call when profile setup is complete
  const completeProfileSetup = useCallback(() => {
    setProfileCompleted(true);
    localStorage.setItem(PROFILE_SETUP_KEY, "true");
    setWalletInfo((prev) => ({ ...prev, showProfileSetup: false }));
    // Potentially, after completing profile setup, we might want to re-verify auth
    // or assume the registration process handled session/token.
    // For now, just closing the modal and updating local state.
  }, []);

  const customSignMessage = useCallback(async (message: Uint8Array, encoding: string = 'utf8'): Promise<{ signature: Uint8Array; publicKey: PublicKey | null }> => {
    if (window.solana && window.solana.signMessage && window.solana.publicKey) {
      return window.solana.signMessage(message, encoding);
    }
    // Hoặc throw error nếu không thể ký
    throw new Error("Wallet not connected or signMessage not available.");
  }, []); // Dependencies: publicKey nếu nó thay đổi và cần thiết cho signMessage (thường là có)

  return {
    ...walletInfo,
    connect,
    disconnect,
    signMessage: customSignMessage, // Thêm signMessage vào đây
    closeProfileSetup,
    completeProfileSetup,
    profileCompleted,
  };
};
