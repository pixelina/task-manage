<template>
  <div class="home-view">
    <ProjectsTable
      :projects="table.projects.value"
      :columns="table.columns.value"
      :is-loading="isPageLoading"
      :sort-key="table.sortKey.value != null ? String(table.sortKey.value) : ''"
      :sort-dir="table.sortDir.value"
      :toolbar="projectsToolbarConfig"
      :search="table.searchTerm.value"
      :filters="table.filters.value"
      @sort="onSort"
      @update:column-width="onColumnResize"
      @update:search="onSearch"
      @update:filter="onFilter"
      @add="onAdd"
      @edit="onEdit"
      @delete="onDeleteClick"
      @reorder="onProjectReorder"
    />
    <AddProjectModal
      v-model="modalOpen"
      :project="editProject"
      @success="onModalSuccess"
    />
    <ConfirmDialog
      v-model="confirmDeleteOpen"
      title="Видалити проєкт?"
      :message="confirmDeleteMessage"
      confirm-label="Видалити"
      cancel-label="Скасувати"
      variant="danger"
      @confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProjectsStore } from '@/store/projects.store'
import { useTasksStore } from '@/store/tasks.store'
import { useProjectsTable } from '@/composables/useProjectsTable'
import { useToast } from '@/composables/useToast'
import type { Project } from '@/types'
import ProjectsTable from '@/components/features/project/ProjectsTable.vue'
import AddProjectModal from '@/components/features/project/AddProjectModal.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

const table = useProjectsTable()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const toast = useToast()

const initialLoadDone = ref(false)
const isPageLoading = computed(
  () => !initialLoadDone.value || table.isLoading.value
)

const modalOpen = ref(false)
const editProject = ref<Project | null>(null)
const confirmDeleteOpen = ref(false)
const projectToDelete = ref<Project | null>(null)

const confirmDeleteMessage = computed(() => {
  const p = projectToDelete.value
  if (!p) return ''
  return `Ви впевнені, що хочете видалити проєкт «${p.name}»? Цю дію не можна скасувати.`
})

const statusOptions = computed(() => {
  const set = new Set(projectsStore.projects.map((p) => p.status).filter(Boolean))
  return Array.from(set).map((s) => ({ value: s, label: s }))
})

const projectsToolbarConfig = computed(() => ({
  addLabel: 'Додати проєкт',
  search: { placeholder: 'Пошук по назві...' },
  filters: [
    { key: 'status', options: statusOptions.value, placeholder: 'Усі статуси' },
  ],
}))

onMounted(async () => {
  try {
    await Promise.all([table.fetchProjects(), tasksStore.fetchTasks()])
  } finally {
    initialLoadDone.value = true
  }
})

function onSearch(value: string) {
  table.setSearch(value)
}

function onFilter(key: string, value: string | number) {
  table.setFilter(key, value)
}

function onAdd() {
  editProject.value = null
  modalOpen.value = true
}

function onEdit(project: Project) {
  editProject.value = project
  modalOpen.value = true
}

function onModalSuccess() {
  if (editProject.value) {
    toast.success('Проєкт оновлено')
  } else {
    toast.success('Проєкт успішно додано')
  }
  editProject.value = null
}

function onDeleteClick(project: Project) {
  projectToDelete.value = project
  confirmDeleteOpen.value = true
}

async function onConfirmDelete() {
  const project = projectToDelete.value
  if (!project) return
  try {
    await projectsStore.deleteProject(project.id)
    table.fetchProjects()
    confirmDeleteOpen.value = false
    projectToDelete.value = null
    toast.success('Проєкт видалено')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Помилка видалення')
  }
}

function onSort(columnKey: string) {
  table.toggleSort(columnKey)
}

function onColumnResize(columnKey: string, width: number) {
  table.onColumnResize(columnKey, width)
}

function onProjectReorder(fromIndex: number, toIndex: number) {
  table.moveProjectRow(fromIndex, toIndex)
}
</script>

