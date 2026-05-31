import { API_BASE } from "./api";

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
};

export type AuthUser = NonNullable<AuthResponse["user"]>;

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
};

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMessage = data.error || data.message || `HTTP ${res.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

async function handleApiResponse<T>(res: Response): Promise<T> {
  const data = await handleResponse<ApiResponse<T> | T>(res);
  if (data && typeof data === "object" && "data" in data) {
    return (data as ApiResponse<T>).data;
  }

  return data as T;
}

export async function register(
  payload: RegisterRequest,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const user = await handleApiResponse<AuthResponse["user"]>(res);
  const loginResponse = await login({
    email: payload.email,
    password: payload.password,
  });

  return {
    ...loginResponse,
    user,
  };
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleApiResponse<AuthResponse>(res);
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse<AuthUser>(res);
}
