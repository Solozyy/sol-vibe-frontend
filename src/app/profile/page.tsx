"use client";

import { ProfileHeader } from "@/components/profile-header";
import { ProfileTabs } from "@/components/profile-tabs";
import { NavBar } from "@/components/nav-bar";
import { usePhantomWalletContext } from "@/providers/PhantomWalletProvider";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { connected, connect, disconnect, address, connecting } =
    usePhantomWalletContext();
  const { user } = useUser();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Wait a moment for wallet reconnection before redirecting
  useEffect(() => {
    const checkAuth = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 1000); // Give time for auto-reconnect to complete

    return () => clearTimeout(checkAuth);
  }, []);

  // Redirect to main page if not connected and finished checking auth
  useEffect(() => {
    if (!isCheckingAuth && !connected) {
      router.push("/");
    }
  }, [connected, router, isCheckingAuth]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!connected || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        walletConnected={connected}
        connectWallet={connect}
        disconnectWallet={disconnect}
        scrollToSection={scrollToSection}
        walletAddress={address}
        isConnecting={connecting}
      />
      <div className="container mx-auto px-6 pt-32 pb-20">
        <ProfileHeader />
        <ProfileTabs />
      </div>
    </div>
  );
}
