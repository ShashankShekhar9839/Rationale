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

type OrganizationApiResponse = Organization & {
  ID?: number;
  Name?: string;
  Description?: string;
  OwnerID?: number;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
};

const CURRENT_ORGANIZATION_KEY = "rationale_current_organization";

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

  return normalizeOrganization(await handleApiResponse<OrganizationApiResponse>(res));
}

export async function getOrganizations(token: string): Promise<Organization[]> {
  const res = await fetch(`${API_BASE}/organizations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const organizations =
    await handleApiResponse<OrganizationApiResponse[] | null>(res);

  return Array.isArray(organizations)
    ? organizations.map(normalizeOrganization)
    : [];
}

function normalizeOrganization(org: OrganizationApiResponse): Organization {
  return {
    id: org.id ?? org.ID ?? 0,
    name: org.name ?? org.Name ?? "",
    description: org.description ?? org.Description,
    ownerId: org.ownerId ?? org.OwnerID ?? 0,
  };
}

export function saveCurrentOrganization(organization: Organization) {
  localStorage.setItem(
    CURRENT_ORGANIZATION_KEY,
    JSON.stringify(organization),
  );
}

export function getCurrentOrganization(): Organization | null {
  const raw = localStorage.getItem(CURRENT_ORGANIZATION_KEY);
  if (!raw) return null;

  try {
    return normalizeOrganization(JSON.parse(raw));
  } catch {
    localStorage.removeItem(CURRENT_ORGANIZATION_KEY);
    return null;
  }
}
