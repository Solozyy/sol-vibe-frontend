"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePhantomWalletContext } from "@/providers/PhantomWalletProvider";
import { NavBar } from "@/components/nav-bar";

export default function HomePage() {
  const router = useRouter();
  const {
    connected: walletConnected,
    connect: connectWallet,
    disconnect: disconnectWallet,
    address,
    connecting,
    profileCompleted,
  } = usePhantomWalletContext();

  // Check if user is authenticated before redirecting
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
      router.push("/");
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to SolVibe</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your profile has been successfully created. Start exploring the
            decentralized social experience!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feed Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Feed</h3>
            <p className="text-gray-600 mb-4">
              Discover content from creators across the platform.
            </p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 transition-colors">
              Explore Feed
            </Button>
          </div>

          {/* Create Content Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Create</h3>
            <p className="text-gray-600 mb-4">
              Share your content as NFTs and earn rewards.
            </p>
            <Button className="w-full bg-gradient-to-r from-[#9C43FF] to-[#0FFF9A] hover:opacity-90 transition-opacity">
              Create Content
            </Button>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Profile</h3>
            <p className="text-gray-600 mb-4">
              View and edit your profile, manage your NFTs.
            </p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 transition-colors">
              View Profile
            </Button>
          </div>
        </div>

        {/* Wallet Section */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8 border border-purple-100 max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-1">Your Wallet</h3>
              <p className="text-purple-600 break-all">{address}</p>
            </div>
            <div className="bg-green-100 px-3 py-1 rounded-full">
              <span className="text-green-700 text-sm font-medium">
                Connected
              </span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              View on Explorer
            </Button>
            <Button
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Copy Address
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
