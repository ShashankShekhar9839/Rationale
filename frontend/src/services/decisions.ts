import { API_BASE } from './api'

export async function getDecisionsByProject(projectId: number) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/decisions`)
  if (!res.ok) throw new Error('failed to fetch decisions')
  return res.json()
}

export async function getDecisionById(decisionId: number) {
  const res = await fetch(`${API_BASE}/decisions/${decisionId}`)
  if (!res.ok) throw new Error('failed to fetch decision')
  return res.json()
}

export async function createDecision(payload: any) {
  const res = await fetch(`${API_BASE}/decisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('failed to create decision')
  return res.json()
}
