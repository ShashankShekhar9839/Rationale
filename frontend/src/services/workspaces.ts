import { API_BASE } from "./api";
import type { AuditMeta } from "../utils/audit";

export type Workspace = AuditMeta & {
  id: number;
  name: string;
  description?: string;
  organization_id: number;
};

export type CreateWorkspaceRequest = {
  name: string;
  description?: string;
  organization_id: number;
};

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMessage = data.error || data.message || `HTTP ${res.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

export async function getWorkspaces(token: string): Promise<Workspace[]> {
  const res = await fetch(`${API_BASE}/workspaces`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const workspaces = await handleResponse<Workspace[] | null>(res);
  return Array.isArray(workspaces) ? workspaces : [];
}

export async function createWorkspace(
  payload: CreateWorkspaceRequest,
  token: string,
): Promise<Workspace> {
  const res = await fetch(`${API_BASE}/workspaces`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Workspace>(res);
}

export async function getWorkspace(
  workspaceId: number,
  token: string,
): Promise<Workspace> {
  const res = await fetch(`${API_BASE}/workspaces/${workspaceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse<Workspace>(res);
}
