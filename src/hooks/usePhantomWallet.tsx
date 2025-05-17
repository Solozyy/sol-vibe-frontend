import { useState, useEffect, useCallback } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

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
      return localStorage.getItem(PROFILE_SETUP_KEY) === "true";
    }
    return false;
  });

  // Function to check if user profile exists in backend
  // This is a mock for now, will be replaced with actual API call later
  const checkUserProfileExists = useCallback(async (walletAddress: string) => {
    console.log("Checking if profile exists for wallet:", walletAddress);

    // Mock API call - simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For now, just check localStorage
    // Later, this will be an API call to check if the user exists in the database
    const exists = localStorage.getItem(PROFILE_SETUP_KEY) === "true";
    console.log("Profile exists:", exists);

    return exists;
  }, []);

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

          // Update stored address
          localStorage.setItem(WALLET_ADDRESS_KEY, address);
        } else {
          // Wallet disconnected or changed to a locked state
          setWalletInfo((prev) => ({
            ...prev,
            address: null,
            connected: false,
          }));

          // Clear stored data
          localStorage.removeItem(WALLET_CONNECTION_KEY);
          localStorage.removeItem(WALLET_ADDRESS_KEY);
        }
      });

      // Listen for connection events
      window.solana.on("connect", (publicKey: PublicKey) => {
        const address = publicKey.toString();
        setWalletInfo((prev) => ({
          ...prev,
          address,
          connected: true,
          connecting: false,
          showProfileSetup: !profileCompleted,
        }));

        // Store connection info
        localStorage.setItem(WALLET_CONNECTION_KEY, "true");
        localStorage.setItem(WALLET_ADDRESS_KEY, address);
      });

      window.solana.on("disconnect", () => {
        setWalletInfo((prev) => ({
          ...prev,
          address: null,
          connected: false,
          connecting: false,
          showProfileSetup: false,
        }));

        // Clear stored data
        localStorage.removeItem(WALLET_CONNECTION_KEY);
        localStorage.removeItem(WALLET_ADDRESS_KEY);
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

      setWalletInfo({
        address,
        connected: true,
        connecting: false,
        walletExists: true,
        // Don't show profile setup yet - we'll check if needed
        showProfileSetup: false,
      });

      // Store connection info
      localStorage.setItem(WALLET_CONNECTION_KEY, "true");
      localStorage.setItem(WALLET_ADDRESS_KEY, address);

      // Check if we need to show profile setup
      await showProfileSetupIfNeeded(address);
    } catch (error) {
      console.error("Failed to connect to Phantom wallet:", error);
      setWalletInfo((prev) => ({ ...prev, connecting: false }));

      // Clear stored data in case of error
      localStorage.removeItem(WALLET_CONNECTION_KEY);
      localStorage.removeItem(WALLET_ADDRESS_KEY);
    }
  }, [showProfileSetupIfNeeded]);

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
  }, []);

  return {
    ...walletInfo,
    connect,
    disconnect,
    closeProfileSetup,
    completeProfileSetup,
    profileCompleted,
  };
};
