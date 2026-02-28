import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project } from '@/types'
import * as projectsApi from '@/api/projects.api'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const projectsById = computed(() => {
    const map = new Map<number, Project>()
    for (const p of projects.value) {
      map.set(p.id, p)
    }
    return map
  })

  async function fetchProjects() {
    isLoading.value = true
    error.value = null
    try {
      projects.value = await projectsApi.fetchProjects()
      return projects.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch projects'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProject(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const project = await projectsApi.fetchProject(id)
      const index = projects.value.findIndex((p) => p.id === id)
      if (index >= 0) {
        projects.value[index] = project
      } else {
        projects.value.push(project)
      }
      return project
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch project'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createProject(payload: Omit<Project, 'id' | 'createdAt'>) {
    error.value = null
    const project = await projectsApi.createProject(payload)
    projects.value.push(project)
    return project
  }

  async function updateProject(id: number, payload: Partial<Project>) {
    error.value = null
    const project = await projectsApi.updateProject(id, payload)
    const index = projects.value.findIndex((p) => p.id === id)
    if (index >= 0) {
      projects.value[index] = project
    } else {
      projects.value.push(project)
    }
    return project
  }

  async function deleteProject(id: number) {
    error.value = null
    await projectsApi.deleteProject(id)
    projects.value = projects.value.filter((p) => p.id !== id)
  }

  function setProjects(value: Project[]) {
    projects.value = value
  }

  function clearError() {
    error.value = null
  }

  return {
    projects,
    isLoading,
    error,
    projectsById,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    setProjects,
    clearError,
  }
})
