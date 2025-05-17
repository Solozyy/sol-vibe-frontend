import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SolVibe - Decentralized Social Media on Solana",
  description:
    "Empowering creators with decentralized ownership, privacy, and fair rewards.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth light">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
