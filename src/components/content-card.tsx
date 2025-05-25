import Image from "next/image";
import { Heart, MessageCircle, Share, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  title: string;
  creator: string;
  upvotes: number;
  image: string;
  type: "image" | "video" | "audio";
  price: string;
}

export function ContentCard({ post }: { post: Post }) {
  return (
    <div className="content-card group">
      <div className="relative">
        <Image
          src={post.image || "/placeholder.svg"}
          alt={post.title}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className="nft-badge">NFT</span>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button className="gradient-button">View Details</Button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 truncate">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3">by {post.creator}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{post.upvotes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>12</span>
            </div>
            <div className="flex items-center space-x-1">
              <Share className="w-4 h-4" />
              <span>8</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#9945FF]">{post.price}</span>
          <Button
            size="sm"
            variant="outline"
            className="border-[#14F195] text-[#14F195] hover:bg-green-50"
          >
            <Coins className="w-4 h-4 mr-1" />
            Tip SOLV
          </Button>
        </div>
      </div>
    </div>
  );
}
