import { API_BASE } from "./api";

export type Decision = {
  id: number;
  title: string;
  description?: string;
  project_id: number;
};

export type DecisionVersion = {
  id: number;
  version_number: number;
  label: string;
  content: string;
  decision_id: number;
};

export type DecisionVersionHistory = {
  id: number;
  version_number: number;
  label: string;
  created_at: string;
};

export type DecisionDetails = Decision & {
  latest_version: DecisionVersion | null;
};

export type CreateDecisionRequest = {
  title: string;
  description?: string;
  project_id: number;
};

export type CreateDecisionVersionRequest = {
  label: string;
  content: string;
};

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMessage = data.error || data.message || `HTTP ${res.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

function normalizeVersion(version: any): DecisionVersion {
  return {
    id: version.id ?? version.ID ?? 0,
    version_number: version.version_number ?? version.VersionNumber ?? 0,
    label: version.label ?? version.Label ?? "",
    content: version.content ?? version.Content ?? "",
    decision_id: version.decision_id ?? version.DecisionID ?? 0,
  };
}

function normalizeDecisionDetails(decision: any): DecisionDetails {
  return {
    id: decision.id ?? decision.ID ?? 0,
    title: decision.title ?? decision.Title ?? "",
    description: decision.description ?? decision.Description ?? "",
    project_id: decision.project_id ?? decision.ProjectID ?? 0,
    latest_version: decision.latest_version
      ? normalizeVersion(decision.latest_version)
      : null,
  };
}

export async function getDecisionsByProject(
  projectId: number,
  token: string,
): Promise<Decision[]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/decisions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const decisions = await handleResponse<Decision[] | null>(res);
  return Array.isArray(decisions) ? decisions : [];
}

export async function getDecisionById(
  decisionId: number,
  token: string,
): Promise<DecisionDetails> {
  const res = await fetch(`${API_BASE}/decisions/${decisionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return normalizeDecisionDetails(await handleResponse<any>(res));
}

export async function createDecision(
  payload: CreateDecisionRequest,
  token: string,
): Promise<Decision> {
  const res = await fetch(`${API_BASE}/decisions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Decision>(res);
}

export async function createDecisionVersion(
  decisionId: number,
  payload: CreateDecisionVersionRequest,
  token: string,
): Promise<DecisionVersion> {
  const res = await fetch(`${API_BASE}/decisions/${decisionId}/versions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<DecisionVersion>(res);
}

export async function patchDecisionVersion(
  versionId: number,
  payload: CreateDecisionVersionRequest,
  token: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/decision-versions/${versionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  await handleResponse(res);
}

export async function getDecisionVersionHistory(
  decisionId: number,
  token: string,
): Promise<DecisionVersionHistory[]> {
  const res = await fetch(`${API_BASE}/decisions/${decisionId}/versions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const versions = await handleResponse<DecisionVersionHistory[] | null>(res);
  return Array.isArray(versions) ? versions : [];
}

export async function getDecisionVersion(
  versionId: number,
  token: string,
): Promise<DecisionVersion> {
  const res = await fetch(`${API_BASE}/decision-versions/${versionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse<DecisionVersion>(res);
}
