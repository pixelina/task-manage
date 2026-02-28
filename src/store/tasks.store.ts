import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskStatus } from '@/types'
import * as tasksApi from '@/api/tasks.api'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const tasksByProjectId = computed(() => {
    const map = new Map<number, Task[]>()
    for (const task of tasks.value) {
      const list = map.get(task.projectId) ?? []
      list.push(task)
      map.set(task.projectId, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.order - b.order)
    }
    return map
  })

  function getTasksForProject(projectId: number): Task[] {
    return tasksByProjectId.value.get(projectId) ?? []
  }

  async function fetchTasks(projectId?: number) {
    isLoading.value = true
    error.value = null
    try {
      const list = await tasksApi.fetchTasks(projectId)
      if (projectId != null) {
        const rest = tasks.value.filter((t) => t.projectId !== projectId)
        tasks.value = [...rest, ...list]
      } else {
        tasks.value = list
      }
      return list
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch tasks'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTask(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const task = await tasksApi.fetchTask(id)
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index >= 0) {
        tasks.value[index] = task
      } else {
        tasks.value.push(task)
      }
      return task
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch task'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createTask(payload: Omit<Task, 'id'>) {
    error.value = null
    const task = await tasksApi.createTask(payload)
    tasks.value.push(task)
    return task
  }

  async function updateTask(id: number, payload: Partial<Task>) {
    error.value = null
    const task = await tasksApi.updateTask(id, payload)
    const index = tasks.value.findIndex((t) => t.id === id)
    const merged = { ...(index >= 0 ? tasks.value[index] : task), ...task, ...payload }
    if (index >= 0) {
      tasks.value[index] = merged
    } else {
      tasks.value.push(merged)
    }
    return merged
  }

  async function updateTaskOrder(id: number, order: number) {
    return updateTask(id, { order })
  }

  async function updateTaskStatus(id: number, status: TaskStatus, order?: number) {
    const payload: Partial<Task> = { status }
    if (order !== undefined) {
      payload.order = order
    }
    return updateTask(id, payload)
  }

  async function deleteTask(id: number) {
    error.value = null
    await tasksApi.deleteTask(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  function setTasks(value: Task[]) {
    tasks.value = value
  }

  function clearError() {
    error.value = null
  }

  return {
    tasks,
    isLoading,
    error,
    tasksByProjectId,
    getTasksForProject,
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    updateTaskOrder,
    updateTaskStatus,
    deleteTask,
    setTasks,
    clearError,
  }
})
