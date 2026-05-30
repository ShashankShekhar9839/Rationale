export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("network");
  return res.json();
}

export default {
  getHealth,
  API_BASE,
};
