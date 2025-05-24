"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { X, Upload, User, FileText } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { PhantomWindow } from "@/hooks/usePhantomWallet";
import {
  authControllerRegister,
  authControllerVerify,
} from "@/services/apiService";
import type { RegisterDto, VerifyDto } from "@/types/api";
import bs58 from "bs58";
import { useAuth } from "@/contexts/AuthContext";

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
  const { login: authLogin } = useAuth();
  const [step, setStep] = useState(1); // 1: Form, 2: Signing, 3: Processing
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [messageToSign, setMessageToSign] = useState<string | null>(null);
  const [generatedSignature, setGeneratedSignature] = useState<string | null>(
    null
  );
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
  const handleFormSubmit = async () => {
    if (!walletAddress) {
      alert("Wallet address is not available. Please connect your wallet.");
      return;
    }
    // Validate required fields
    if (!formData.username || !formData.displayName) {
      alert("Username and display name are required");
      return;
    }

    setIsLoading(true);
    setStep(2); // Optimistically move to signing prompt, or could be 2.5 (intermediate step before signing)

    try {
      const registerPayload: RegisterDto = {
        walletAddress,
        username: formData.username,
        name: formData.displayName, // Map displayName to name
        bio: formData.bio,
      };
      console.log("Attempting to register with payload:", registerPayload);
      const registerResponse = await authControllerRegister(registerPayload);

      if (registerResponse.message) {
        setMessageToSign(registerResponse.message);
        // Already moved to step 2 (Signing)
        // UI should now prompt to sign the message `registerResponse.messageToSign`
        console.log("Received message to sign:", registerResponse.message);
      } else {
        throw new Error(
          "Failed to get message to sign from registration process."
        );
      }
    } catch (error) {
      console.error("Error during registration submission:", error);
      alert(
        `Registration failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setStep(1); // Go back to form
    } finally {
      setIsLoading(false);
    }
  };

  // Handle message signing and then verification
  const handleSignAndVerify = async () => {
    if (!walletAddress || !messageToSign) {
      alert("Missing wallet address or message to sign. Please try again.");
      setStep(1);
      return;
    }

    setIsLoading(true);
    // Step 3 is processing, which is appropriate here

    try {
      // 1. Create the message to sign (as Uint8Array for Phantom)
      const messageBytes = new TextEncoder().encode(messageToSign);

      // 2. Request message signing from Phantom wallet
      if (window.solana && window.solana.signMessage) {
        const signedMessage = await window.solana.signMessage(
          messageBytes,
          "utf8"
        );
        // The signature is Uint8Array, convert to base58 string for the backend.
        const signatureString = bs58.encode(signedMessage.signature);
        setGeneratedSignature(signatureString); // Save for potential display or retry

        console.log("Message signed. Signature (Base58):", signatureString);
        setStep(3); // Move to processing step before API call

        // 3. Verify the signature with the backend
        const verifyPayload: VerifyDto = {
          walletAddress,
          message: messageToSign, // The original message that was signed
          signature: signatureString, // The generated signature string
        };
        console.log("Attempting to verify with payload:", verifyPayload);
        const verifyResponse = await authControllerVerify(verifyPayload);

        console.log("Verification successful:", verifyResponse);
        // Store JWT token (verifyResponse.accessToken) securely (e.g., HttpOnly cookie or secure local storage)
        // For this example, we'll assume it's handled or log it.
        // console.log("Access Token:", verifyResponse.accessToken);

        // Gọi hàm login từ AuthContext
        if (verifyResponse.user && verifyResponse.accessToken) {
          authLogin(verifyResponse.user, verifyResponse.accessToken);
        } else {
          // Xử lý trường hợp không có user hoặc token dù API thành công (ít xảy ra nếu API đúng)
          throw new Error("Verification response missing user or token.");
        }

        // completeProfileSetup(); // Hàm này từ usePhantomWallet, có thể AuthProvider đã xử lý trạng thái tương tự
        // Nếu completeProfileSetup chỉ để đóng modal và cập nhật state local của usePhantomWallet,
        // thì vẫn có thể giữ lại hoặc thay bằng logic trực tiếp.
        // Hiện tại, chúng ta ưu tiên AuthContext quản lý trạng thái xác thực.
        // Xem xét lại vai trò của completeProfileSetup từ props
        // Nếu ProfileSetupModal chỉ chịu trách nhiệm đăng ký và AuthContext.login cập nhật trạng thái toàn cục,
        // thì completeProfileSetup có thể chỉ gọi props.onClose() hoặc một hành động UI cụ thể.
        // Để đơn giản, giả sử AuthContext.login là đủ để cập nhật trạng thái, ta sẽ đóng modal.
        // Gọi onClose được truyền từ props để đóng modal
        onClose(); // Giả sử onClose là hàm đóng modal được truyền từ parent

        router.push("/explore"); // Redirect to home or dashboard
      } else {
        throw new Error(
          "Phantom wallet not available or signMessage method missing."
        );
      }
    } catch (error) {
      console.error("Error during signing or verification:", error);
      alert(
        `Operation failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setStep(1);
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
              Confirm your profile creation by signing the message requested by
              your wallet. The message is: "
              <strong>{messageToSign || "Loading message..."}</strong>"
            </p>
            <Button
              onClick={handleSignAndVerify}
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
            {isLoading
              ? "Processing registration..."
              : messageToSign
              ? "Ready to sign the message above."
              : "Requesting message..."}
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
