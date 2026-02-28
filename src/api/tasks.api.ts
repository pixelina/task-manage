import { apiClient } from './axios'
import type { Task, TaskStatus } from '@/types'

const ENDPOINT = '/tasks'

const TASK_STATUSES: TaskStatus[] = ['To do', 'In progress', 'Done']

function toTaskStatus(s: string): TaskStatus {
  if (s === 'To do' || s === 'In progress' || s === 'Done') return s
  return 'To do'
}

function normalizeTask(raw: Record<string, unknown>): Task {
  const status = toTaskStatus(String(raw.status ?? 'To do').trim())
  return {
    id: Number(raw.id),
    projectId: Number(raw.projectId),
    title: String(raw.title ?? ''),
    assignee: raw.assignee != null ? String(raw.assignee) : undefined,
    status,
    dueDate: raw.dueDate != null ? String(raw.dueDate) : '',
    order: Number(raw.order) || 0,
  }
}

export async function fetchTasks(projectId?: number): Promise<Task[]> {
  const url = projectId != null ? `${ENDPOINT}?projectId=${projectId}` : ENDPOINT
  const { data } = await apiClient.get<Record<string, unknown>[]>(url)
  return Array.isArray(data) ? data.map(normalizeTask) : []
}

export async function fetchTask(id: number): Promise<Task> {
  const { data } = await apiClient.get<Record<string, unknown>>(`${ENDPOINT}/${id}`)
  return normalizeTask(data ?? {})
}

export async function createTask(payload: Omit<Task, 'id'>): Promise<Task> {
  const { data } = await apiClient.post<Record<string, unknown>>(ENDPOINT, payload)
  return normalizeTask(data ?? {})
}

export async function updateTask(id: number, payload: Partial<Task>): Promise<Task> {
  const { data } = await apiClient.put<Record<string, unknown>>(`${ENDPOINT}/${id}`, payload)
  return normalizeTask(data ?? {})
}

export async function deleteTask(id: number): Promise<void> {
  await apiClient.delete(`${ENDPOINT}/${id}`)
}
