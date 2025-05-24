"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePhantomWalletContext } from "@/providers/PhantomWalletProvider";
import { NavBar } from "@/components/nav-bar";
import ExploreContent from "@/components/explore/ExploreContent";

const ExclusivePage = () => {
  const router = useRouter();
  const {
    connected: walletConnected,
    connect: connectWallet,
    disconnect: disconnectWallet,
    address,
    connecting,
    profileCompleted,
  } = usePhantomWalletContext();

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
    if (!isCheckingAuth && !walletConnected) {
      // router.push("/"); // Decide if you want to redirect if wallet is not connected
    }
  }, [walletConnected, router, isCheckingAuth]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Navigation */}
      <NavBar
        walletConnected={walletConnected}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        scrollToSection={scrollToSection}
        walletAddress={address}
        isConnecting={connecting}
      />

      {/* Main content */}
      <div className="container mx-auto px-6 pt-32 pb-20">
        {/* The ExploreContent component will be placed here */}
        <ExploreContent />
      </div>
    </div>
  );
};

export default ExclusivePage;
