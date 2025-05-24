"use client";

import React, { useEffect, useState, use } from "react"; // Ensure 'use' is imported
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePhantomWalletContext } from "@/providers/PhantomWalletProvider";
import { NavBar } from "@/components/nav-bar";
// Import any profile-specific components you need here
import ProfileContent from '@/components/profile/ProfileContent'; // Example

interface ProfilePageProps {
  params: Promise<{ // As per previous fix
    wallet: string;
  }>;
  // Modify searchParams to be an optional Promise resolving to the search params object
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

function ProfilePage({ params: paramsPromise, searchParams: searchParamsPromise }: ProfilePageProps) {
  const router = useRouter();

  // Use React.use() to unwrap the params Promise
  const params = use(paramsPromise);

  // Conditionally unwrap searchParams if they are provided as a promise
  // This is only necessary if you intend to use the searchParams values.
  // If searchParams are not used in this component, this line can be omitted,
  // but the type definition in ProfilePageProps must still be correct.
  const resolvedSearchParams = searchParamsPromise ? use(searchParamsPromise) : undefined;

  // Example of how you might use resolvedSearchParams:
  // if (resolvedSearchParams && resolvedSearchParams.someQuery) {
  //   console.log("Query param 'someQuery':", resolvedSearchParams.someQuery);
  // }

  const {
    connected: walletConnected,
    connect: connectWallet,
    disconnect: disconnectWallet,
    address,
    connecting,
    // profileCompleted, // This was unused
  } = usePhantomWalletContext();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 1000);

    return () => clearTimeout(checkAuth);
  }, []);

  // Optional: Redirect if wallet is not connected and auth check is done
  // useEffect(() => {
  //   if (!isCheckingAuth && !walletConnected) {
  //     router.push("/");
  //   }
  // }, [walletConnected, router, isCheckingAuth]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <NavBar
        walletConnected={walletConnected}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        scrollToSection={scrollToSection}
        walletAddress={address}
        isConnecting={connecting}
      />

      <div className="container mx-auto px-6 pt-32 pb-20">
        <ProfileContent walletAddress={params.wallet} />

        {walletConnected && address === params.wallet && (
          <div className="mt-16 bg-white rounded-xl shadow-lg p-8 border border-purple-100 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-1">Your Connected Wallet</h3>
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
        )}
      </div>
    </div>
  );
};

export default ProfilePage;