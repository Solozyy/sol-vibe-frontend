import {
  CheckWalletDto,
  RegisterDto,
  VerifyDto,
  RequestSignatureDto,
  CheckWalletResponse,
  RegisterResponse,
  RequestSignatureResponse,
  VerifyResponse,
  ApiErrorResponse,
} from "@/types/api";

const API_BASE_URL = "http://localhost:3000";
const TOKEN_STORAGE_KEY = 'solVibe_authToken'; // Key giống với trong AuthContext

// Hàm helper để lấy token từ localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }
  return null;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(
      Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : errorData.message || `API request failed with status ${response.status}`,
    );
  }
  return response.json();
}

// Helper để tạo headers, thêm Authorization nếu có token
const createHeaders = (includeContentTypeJson = true): HeadersInit => {
  const headers: HeadersInit = {};
  if (includeContentTypeJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const appControllerGetHello = async (): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/`, {
    headers: createHeaders(false), // GET không cần Content-Type JSON
  });
  // For this specific endpoint, the response is plain text
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.text();
};

export const appControllerGetProfile = async (): Promise<any> => { // Replace 'any' with a specific type if profile structure is known
  const response = await fetch(`${API_BASE_URL}/profile`, {
    headers: createHeaders(false), // GET không cần Content-Type JSON, nhưng cần Authorization
  });
  return handleResponse<any>(response); // Replace 'any' here too
};

export const authControllerCheckWallet = async (
  data: CheckWalletDto,
): Promise<CheckWalletResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/check-wallet`, {
    method: "POST",
    headers: createHeaders(), // POST cần Content-Type và có thể cần Auth (dù endpoint này thường không)
    body: JSON.stringify(data),
  });
  return handleResponse<CheckWalletResponse>(response);
};

export const authControllerRegister = async (
  data: RegisterDto,
): Promise<RegisterResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<RegisterResponse>(response);
};

export const authControllerRequestSignatureMessage = async (
  data: RequestSignatureDto,
): Promise<RequestSignatureResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/request-signature`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<RequestSignatureResponse>(response);
};

export const authControllerVerify = async (
  data: VerifyDto,
): Promise<VerifyResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<VerifyResponse>(response);
}; 