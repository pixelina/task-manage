import { apiClient } from './axios'
import type { Project } from '@/types'

const ENDPOINT = '/projects'

function normalizeProject(raw: Record<string, unknown>): Project {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ''),
    description: raw.description != null ? String(raw.description) : undefined,
    status: String(raw.status ?? ''),
    createdAt: raw.createdAt != null ? String(raw.createdAt) : '',
  }
}

export async function fetchProjects(): Promise<Project[]> {
  const { data } = await apiClient.get<Record<string, unknown>[]>(ENDPOINT)
  return Array.isArray(data) ? data.map(normalizeProject) : []
}

export async function fetchProject(id: number): Promise<Project> {
  const { data } = await apiClient.get<Record<string, unknown>>(`${ENDPOINT}/${id}`)
  return normalizeProject(data ?? {})
}

export async function createProject(payload: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
  const { data } = await apiClient.post<Record<string, unknown>>(ENDPOINT, payload)
  return normalizeProject(data ?? {})
}

export async function updateProject(id: number, payload: Partial<Project>): Promise<Project> {
  const { data } = await apiClient.put<Record<string, unknown>>(`${ENDPOINT}/${id}`, payload)
  return normalizeProject(data ?? {})
}

export async function deleteProject(id: number): Promise<void> {
  await apiClient.delete(`${ENDPOINT}/${id}`)
}
