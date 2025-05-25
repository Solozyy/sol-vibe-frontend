"use client";

import { useState } from "react";
import { Grid, Heart, Award, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/content-card";
import { usePhantomWalletContext } from "@/providers/PhantomWalletProvider";
import { useUser } from "@/contexts/UserContext";
import { RedeemModal } from "@/components/redeem/RedeemModal";

const userContent = [
  {
    id: "1",
    title: "My First NFT",
    creator: "your.wallet",
    upvotes: 123,
    image: "/placeholder.svg?height=300&width=400&query=first nft creation",
    type: "image" as const,
    price: "2.0 SOL",
  },
  {
    id: "2",
    title: "Solana Tutorial",
    creator: "your.wallet",
    upvotes: 89,
    image: "/placeholder.svg?height=300&width=400&query=solana tutorial video",
    type: "video" as const,
    price: "1.5 SOL",
  },
];

const collectedNFTs = [
  {
    id: "3",
    title: "Cool Art Piece",
    creator: "artist.sol",
    upvotes: 456,
    image: "/placeholder.svg?height=300&width=400&query=collected art nft",
    type: "image" as const,
    price: "3.2 SOL",
  },
];

export function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("created");
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const { user } = useUser();

  const tabs = [
    { id: "created", label: "Created", icon: Grid, count: userContent.length },
    {
      id: "collected",
      label: "Collected",
      icon: Heart,
      count: collectedNFTs.length,
    },
    { id: "badges", label: "Badges", icon: Award, count: 3 },
    { id: "redeem", label: "Redeem", icon: Wallet, count: 0 },
  ];

  return (
    <div>
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => {
                if (tab.id === "redeem") {
                  setShowRedeemModal(true);
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex items-center space-x-2 pb-3 border-b-2 rounded-none ${
                activeTab === tab.id
                  ? "border-[#9945FF] text-[#9945FF]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {tab.count}
              </span>
            </Button>
          );
        })}
      </div>

      <div className="min-h-[400px]">
        {activeTab === "created" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userContent.map((post) => (
              <ContentCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {activeTab === "collected" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collectedNFTs.map((post) => (
              <ContentCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {activeTab === "badges" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Early Adopter
              </h3>
              <p className="text-sm text-gray-600">
                Joined SolVibe in the first month
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#14F195] to-[#9945FF] rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Content Creator
              </h3>
              <p className="text-sm text-gray-600">Created 10+ NFTs</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Community Curator
              </h3>
              <p className="text-sm text-gray-600">
                Active in community voting
              </p>
            </div>
          </div>
        )}
      </div>

      <RedeemModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
      />
    </div>
  );
}
