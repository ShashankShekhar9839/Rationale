import { API_BASE } from "./api";

export type CreateOrganizationRequest = {
  name: string;
  description?: string;
};

export type Organization = {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
};

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

export async function createOrganization(
  payload: CreateOrganizationRequest,
  token: string,
): Promise<Organization> {
  const res = await fetch(`${API_BASE}/organizations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleApiResponse<Organization>(res);
}

export async function getOrganizations(token: string): Promise<Organization[]> {
  const res = await fetch(`${API_BASE}/organizations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse<Organization[]>(res);
}
