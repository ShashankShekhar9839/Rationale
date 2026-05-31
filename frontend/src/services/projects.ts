import { API_BASE } from "./api";

export type Project = {
  id: number;
  name: string;
  description?: string;
  workspace_id: number;
};

export type CreateProjectRequest = {
  name: string;
  description?: string;
  workspace_id: number;
};

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMessage = data.error || data.message || `HTTP ${res.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

export async function getProjectsByWorkspace(
  workspaceId: number,
  token: string,
): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects?workspace_id=${workspaceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const projects = await handleResponse<Project[] | null>(res);
  return Array.isArray(projects) ? projects : [];
}

export async function createProject(
  payload: CreateProjectRequest,
  token: string,
): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Project>(res);
}
