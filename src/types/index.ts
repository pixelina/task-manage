export interface Project {
  [key: string]: unknown
  id: number
  name: string
  description?: string
  status: string
  createdAt: string
}

export type TaskStatus = 'To do' | 'In progress' | 'Done'

/** Single filter in the toolbar (e.g. status select). */
export interface ToolbarFilterConfig {
  key: string
  options: { value: string | number; label: string }[]
  placeholder?: string
}

/** Toolbar config: add button label, optional search, optional filters. */
export interface ToolbarConfig {
  addLabel: string
  /** Omit or set to false to hide search. */
  search?: { placeholder?: string } | false
  /** Omit or empty array to hide filter selects. */
  filters?: ToolbarFilterConfig[]
}

export interface Task {
  [key: string]: unknown
  id: number
  projectId: number
  title: string
  assignee?: string
  status: TaskStatus
  dueDate: string
  order: number
}
