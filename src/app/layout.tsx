import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PhantomWalletProvider } from "@/providers/PhantomWalletProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import { WalletProvider } from "@/contexts/WalletContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SolVibe - Decentralized Social Media on Solana",
  description:
    "Empowering creators with decentralized ownership, privacy, and fair rewards.",
  icons: {
    icon: "/solvibe-logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth light">
      <body className={inter.className}>
        <PhantomWalletProvider> {/* PhantomWalletProvider wraps UserProvider */}
        <WalletProvider>
          <UserProvider> {/* UserProvider wraps AuthProvider */}
            <AuthProvider>{children}</AuthProvider>
          </UserProvider>
        </WalletProvider>
        </PhantomWalletProvider>
      </body>
    </html>
  );
}
