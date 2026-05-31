export type AuditUser = {
  id: number;
  name?: string;
  email?: string;
};

export type AuditMeta = {
  created_at?: string;
  updated_at?: string;
  created_by?: AuditUser | null;
  updated_by?: AuditUser | null;
};

export function formatAuditUser(user?: AuditUser | null) {
  return user?.name || user?.email || "Unknown";
}

export function formatAuditDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatCreatedBy(meta: AuditMeta) {
  return `Created by ${formatAuditUser(meta.created_by)}`;
}

export function formatUpdatedBy(meta: AuditMeta) {
  const date = formatAuditDate(meta.updated_at);
  return `Last edited by ${formatAuditUser(meta.updated_by)}${date ? ` on ${date}` : ""}`;
}
