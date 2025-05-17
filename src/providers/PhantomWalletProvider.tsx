"use client";

import { createContext, useContext, ReactNode } from "react";
import { usePhantomWallet, WalletInfo } from "@/hooks/usePhantomWallet";

type PhantomWalletContextType = ReturnType<typeof usePhantomWallet>;

const PhantomWalletContext = createContext<PhantomWalletContextType | null>(
  null
);

export const usePhantomWalletContext = () => {
  const context = useContext(PhantomWalletContext);
  if (!context) {
    throw new Error(
      "usePhantomWalletContext must be used within a PhantomWalletProvider"
    );
  }
  return context;
};

interface PhantomWalletProviderProps {
  children: ReactNode;
}

export const PhantomWalletProvider = ({
  children,
}: PhantomWalletProviderProps) => {
  const walletState = usePhantomWallet();

  return (
    <PhantomWalletContext.Provider value={walletState}>
      {children}
    </PhantomWalletContext.Provider>
  );
};
