export interface CheckWalletDto {
  walletAddress: string;
}

export interface RegisterDto {
  walletAddress: string;
  username: string;
  name: string;
  bio?: string;
}

export interface VerifyDto {
  walletAddress: string;
  message: string;
  signature: string;
}

export interface RequestSignatureDto {
  walletAddress: string;
}

// API Response Types
export interface CheckWalletResponse {
  exists: boolean;
  user?: {
    id: string;
    walletAddress: string;
    username: string;
    name: string;
    bio?: string;
    // Add other user fields if any
  };
}

export interface RegisterResponse {
  message: string;
}

export interface RequestSignatureResponse {
  messageToSign: string;
}

export interface VerifyResponse {
  accessToken: string;
  user: {
    id: string;
    walletAddress: string;
    username: string;
    name: string;
    bio?: string;
    // Add other user fields if any
  };
}

// Generic Error Response (optional, but good practice)
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
} 