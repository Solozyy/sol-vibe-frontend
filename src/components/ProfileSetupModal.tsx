"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { X, Upload, User, FileText } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { PhantomWindow } from "@/hooks/usePhantomWallet";

declare const window: PhantomWindow;

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | null;
  completeProfileSetup: () => void;
}

export function ProfileSetupModal({
  isOpen,
  onClose,
  walletAddress,
  completeProfileSetup,
}: ProfileSetupModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Form, 2: Signing, 3: Processing
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    bio: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleFormSubmit = () => {
    // Validate required fields
    if (!formData.username || !formData.displayName) {
      alert("Username and display name are required");
      return;
    }

    // Move to signing step
    setStep(2);
  };

  // Handle message signing
  const handleSignMessage = async () => {
    try {
      setIsLoading(true);

      // Create the message to sign
      const message = new TextEncoder().encode(
        `Welcome to SolVibe!\n\nThis signature confirms your profile setup with username: ${formData.username}.\n\nWallet: ${walletAddress}`
      );

      // Request message signing from Phantom wallet
      if (window.solana) {
        try {
          // Try using signMessage method
          const signedMessage = await window.solana.signMessage(
            message,
            "utf8"
          );

          // Move to processing step
          setStep(3);

          // Here you would typically send this data to your backend
          console.log("Profile data:", {
            ...formData,
            profileImage,
            walletAddress,
            signature: signedMessage,
          });

          // Mock API call - simulate saving to backend
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Mark profile setup as complete
          completeProfileSetup();

          // Redirect to home
          router.push("/home");
        } catch (signError) {
          console.error("Error signing message:", signError);
          alert("Failed to sign the message. Please try again.");
          setStep(1); // Go back to form
        }
      } else {
        throw new Error("Wallet not connected");
      }
    } catch (error) {
      console.error("Error during profile setup:", error);
      alert("Failed to complete profile setup. Please try again.");
      setStep(1); // Go back to form
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function before the return statement
  const validateForm = () => {
    return (
      formData.username.trim() !== "" && formData.displayName.trim() !== ""
    );
  };

  // Render content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1: // Form
        return (
          <>
            {/* Profile Image Upload */}
            <div className="flex justify-center mb-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#9C43FF] transition-colors group overflow-hidden bg-gray-50"
              >
                {profileImage ? (
                  <Image
                    src={profileImage || "/placeholder.svg"}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#9C43FF]/10 to-[#0FFF9A]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Upload
                      size={24}
                      className="text-gray-400 group-hover:text-[#9C43FF] transition-colors"
                    />
                    <span className="absolute bottom-0 left-0 right-0 text-xs text-center bg-gray-100 py-1 font-medium text-gray-700">
                      Upload
                    </span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  aria-label="Upload profile image"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center text-gray-700">
                  <User size={16} className="mr-2 text-[#9C43FF]" />
                  Username <span className="text-[#FF4D4D] ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g., satoshi_nakamoto"
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:border-[#9C43FF] focus:ring-1 focus:ring-[#9C43FF] transition-all text-gray-800 placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center text-gray-700">
                  <User size={16} className="mr-2 text-[#9C43FF]" />
                  Display Name <span className="text-[#FF4D4D] ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="e.g., Satoshi Nakamoto"
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:border-[#9C43FF] focus:ring-1 focus:ring-[#9C43FF] transition-all text-gray-800 placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center text-gray-700">
                  <FileText size={16} className="mr-2 text-[#9C43FF]" />
                  Bio (Optional)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us a bit about yourself..."
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:border-[#9C43FF] focus:ring-1 focus:ring-[#9C43FF] transition-all resize-none text-gray-800 placeholder:text-gray-400"
                  rows={3}
                />
              </div>
            </div>
          </>
        );

      case 2: // Signing
        return (
          <div className="py-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#9C43FF] to-[#0FFF9A] mx-auto flex items-center justify-center p-1">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <div className="animate-pulse">
                    <User size={36} className="text-[#9C43FF]" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              Please Sign Message
            </h3>
            <p className="text-gray-600 mb-6 max-w-xs mx-auto">
              We need your signature to confirm your profile setup. Please check
              your wallet for a signature request.
            </p>
            <Button
              onClick={handleSignMessage}
              className="bg-gradient-to-r from-[#9C43FF] to-[#0FFF9A] text-black font-medium hover:opacity-90 transition-opacity px-8 py-2.5 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></span>
                  Waiting...
                </span>
              ) : (
                "Sign Now"
              )}
            </Button>
          </div>
        );

      case 3: // Processing
        return (
          <div className="py-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#9C43FF] to-[#0FFF9A] mx-auto flex items-center justify-center p-1">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <div className="h-10 w-10 border-t-2 border-r-2 border-[#9C43FF] rounded-full animate-spin" />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              Creating Your Profile
            </h3>
            <p className="text-gray-600 mb-6 max-w-xs mx-auto">
              We're setting up your profile. This will only take a moment...
            </p>
            <div className="flex items-center justify-center space-x-3">
              <div className="h-2 w-2 bg-[#9C43FF] rounded-full animate-pulse" />
              <div className="h-2 w-2 bg-[#9C43FF] rounded-full animate-pulse delay-150" />
              <div className="h-2 w-2 bg-[#9C43FF] rounded-full animate-pulse delay-300" />
            </div>
          </div>
        );
    }
  };

  // Render footer based on current step
  const renderFooter = () => {
    switch (step) {
      case 1: // Form
        return (
          <Button
            onClick={handleFormSubmit}
            className="w-full relative overflow-hidden group"
            size="lg"
            disabled={!validateForm()}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#9C43FF] to-[#0FFF9A] opacity-100 group-hover:opacity-90 transition-opacity"></span>
            <span className="relative font-medium text-black z-10">
              Continue
            </span>
          </Button>
        );

      case 2: // Signing
        return (
          <p className="text-sm text-center text-gray-500">
            Click the button above to proceed with signing
          </p>
        );

      case 3: // Processing
        return (
          <p className="text-sm text-center text-gray-500">
            Please wait while we complete your profile setup
          </p>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gray-500/30 backdrop-blur-md"
        onClick={step === 1 ? onClose : undefined} // Only allow closing in first step
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md rounded-2xl overflow-hidden bg-gradient-to-b from-white to-gray-50 border border-gray-200 shadow-[0_0_30px_rgba(156,67,255,0.15)]"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#9C43FF] to-[#0FFF9A] bg-clip-text text-transparent">
              {step === 1
                ? "Complete Your Profile"
                : step === 2
                ? "Confirm Your Identity"
                : "Setting Up Profile"}
            </h2>
            {step === 1 && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={18} className="text-gray-500 hover:text-gray-700" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{renderStepContent()}</div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {renderFooter()}
        </div>
      </motion.div>
    </div>
  );
}
