<template>
  <div class="project-view">
    <div v-if="projectError" class="project-view__error">{{ projectError }}</div>
    <template v-else-if="project">
      <RouterLink :to="{ name: 'home' }" class="project-view__back">
        <span class="project-view__back-icon" aria-hidden="true">←</span>
        <span>До списку проєктів</span>
      </RouterLink>
      <div class="project-view__header">
        <h1 class="project-view__title">{{ project.name }}</h1>
        <div class="project-view__header-actions">
          <div class="project-view__view-toggle" role="group" aria-label="Режим перегляду">
            <button
              type="button"
              class="project-view__view-btn"
              :class="{ 'project-view__view-btn--active': kanban.viewMode.value === 'table' }"
              @click="setViewMode('table')"
            >
              Таблиця
            </button>
            <button
              type="button"
              class="project-view__view-btn"
              :class="{ 'project-view__view-btn--active': kanban.viewMode.value === 'kanban' }"
              @click="setViewMode('kanban')"
            >
              Канбан
            </button>
          </div>
        </div>
      </div>
      <div class="project-view__content">
        <TasksTable
          v-show="kanban.viewMode.value === 'table'"
          :tasks="table.tasks.value"
          :columns="table.columns.value"
          :is-loading="table.isLoading.value"
          :sort-key="table.sortKey.value != null ? String(table.sortKey.value) : undefined"
          :sort-dir="table.sortDir.value"
          :toolbar="tasksToolbarConfig"
          :search="table.searchTerm.value"
          :filters="table.filters.value"
          @sort="onSort"
          @update:column-width="onColumnResize"
          @update:search="onSearch"
          @update:filter="onFilter"
          @add="onAddTask"
          @edit="onEditTask"
          @delete="onDeleteTaskClick"
          @reorder="onTaskReorder"
        />
        <TasksKanban
          v-show="kanban.viewMode.value === 'kanban'"
          :columns="kanban.columns.value"
          :items-by-column-id="kanban.itemsByColumnId.value"
          :is-loading="table.isLoading.value"
          :toolbar="tasksKanbanToolbarConfig"
          @add="onAddTask"
          @move="onKanbanMove"
          @reorder="onKanbanReorder"
          @edit="onEditTask"
          @delete="onDeleteTaskClick"
        />
        <TaskDistributionChart :chart-data="chartDataByStatus" />
      </div>
      <AddTaskModal
        v-model="modalOpen"
        :project-id="projectId"
        :task="editTask"
        @success="onTaskModalSuccess"
      />
      <ConfirmDialog
        v-model="confirmDeleteTaskOpen"
        title="Видалити завдання?"
        :message="confirmDeleteTaskMessage"
        confirm-label="Видалити"
        cancel-label="Скасувати"
        variant="danger"
        @confirm="onConfirmDeleteTask"
      />
    </template>
    <div v-else class="project-view__loading">Завантаження проєкту...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import { useProjectsStore } from '@/store/projects.store'
import { useTasksTable } from '@/composables/useTasksTable'
import { useKanban } from '@/composables/useKanban'
import type { ViewMode } from '@/composables/useKanban'
import TasksTable from '@/components/features/task/TasksTable.vue'
import TasksKanban from '@/components/features/task/TasksKanban.vue'
import TaskDistributionChart from '@/components/features/task/TaskDistributionChart.vue'
import AddTaskModal from '@/components/features/task/AddTaskModal.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import { useTasksStore } from '@/store/tasks.store'
import { useToast } from '@/composables/useToast'
import type { Task, TaskStatus } from '@/types'
import type { SelectOption } from '@/components/ui/UiSelect.vue'

const route = useRoute()
const projectId = computed(() => {
  const id = route.params.id
  const num = Number(id)
  return Number.isNaN(num) ? 0 : num
})

const projectsStore = useProjectsStore()
const table = useTasksTable(projectId)
const kanban = useKanban(projectId)
const toast = useToast()

const project = computed(() =>
  projectId.value ? projectsStore.projectsById.get(projectId.value) ?? null : null
)
const projectError = computed(() => projectsStore.error)

const modalOpen = ref(false)
const editTask = ref<Task | null>(null)
const confirmDeleteTaskOpen = ref(false)
const taskToDelete = ref<Task | null>(null)
const tasksStore = useTasksStore()

const confirmDeleteTaskMessage = computed(() => {
  const t = taskToDelete.value
  if (!t) return ''
  return `Ви впевнені, що хочете видалити завдання «${t.title}»? Цю дію не можна скасувати.`
})

const TASK_STATUSES: TaskStatus[] = ['To do', 'In progress', 'Done']
const taskStatusOptions = computed<SelectOption[]>(() =>
  TASK_STATUSES.map((s) => ({ value: s, label: s }))
)

const tasksToolbarConfig = computed(() => ({
  addLabel: 'Додати завдання',
  search: { placeholder: 'Назва або виконавець...' },
  filters: [
    { key: 'status', options: taskStatusOptions.value, placeholder: 'Усі статуси' },
  ],
}))

const tasksKanbanToolbarConfig = { addLabel: 'Додати завдання' }

const chartDataByStatus = computed(() => {
  const byId = kanban.itemsByColumnId.value
  return {
    labels: TASK_STATUSES,
    values: TASK_STATUSES.map((status) => (byId[status] ?? []).length),
  }
})

watch(projectId, (id) => {
  if (id) {
    projectsStore.fetchProject(id).catch(() => {})
    table.fetchTasks()
  }
}, { immediate: false })

onMounted(async () => {
  if (!projectId.value) return
  try {
    await projectsStore.fetchProject(projectId.value)
    await table.fetchTasks()
  } catch {
    // Error shown via projectError
  }
})

function onSearch(value: string) {
  table.setSearch(value)
}

function onFilter(key: string, value: string | number) {
  table.setFilter(key, value)
}

function onAddTask() {
  editTask.value = null
  modalOpen.value = true
}

function onEditTask(task: Task) {
  editTask.value = task
  modalOpen.value = true
}

function onTaskModalSuccess() {
  if (editTask.value) {
    toast.success('Завдання оновлено')
  } else {
    toast.success('Завдання успішно додано')
  }
  editTask.value = null
}

function onDeleteTaskClick(task: Task) {
  taskToDelete.value = task
  confirmDeleteTaskOpen.value = true
}

async function onConfirmDeleteTask() {
  const task = taskToDelete.value
  if (!task) return
  try {
    await tasksStore.deleteTask(task.id)
    table.fetchTasks()
    confirmDeleteTaskOpen.value = false
    taskToDelete.value = null
    toast.success('Завдання видалено')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Помилка видалення')
  }
}

function onTaskReorder(fromIndex: number, toIndex: number) {
  const task = table.tasks.value[fromIndex]
  if (task) table.moveRow(task.id, fromIndex, toIndex)
}

function onSort(columnKey: string) {
  table.toggleSort(columnKey)
}

function onColumnResize(columnKey: string, width: number) {
  table.onColumnResize(columnKey, width)
}

function setViewMode(mode: ViewMode) {
  kanban.viewMode.value = mode
}

function onKanbanMove(payload: { item: Task; fromColumnId: string; toColumnId: string; fromIndex: number; toIndex: number }) {
  kanban.moveCard(payload.item, payload.fromColumnId, payload.toColumnId, payload.toIndex)
}

function onKanbanReorder(payload: { columnId: string; fromIndex: number; toIndex: number }) {
  kanban.reorderInColumn(payload.columnId, payload.fromIndex, payload.toIndex)
}
</script>

<style scoped lang="scss">
.project-view {
  padding: $spacing-lg;

  &__back {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
    margin-bottom: $spacing-md;
    font-size: $font-size-sm;
    color: $color-text-muted;
    text-decoration: none;
    transition: color 0.15s;

    &:hover {
      color: $color-primary;
    }
  }

  &__back-icon {
    font-size: 1.1em;
    line-height: 1;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  &__view-toggle {
    display: inline-flex;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    overflow: hidden;
  }

  &__view-btn {
    min-height: $control-height;
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-base;
    line-height: 1.5;
    color: $color-text-muted;
    background-color: $color-bg;
    border: none;
    cursor: pointer;
    box-sizing: border-box;
    transition: color 0.15s, background-color 0.15s;

    &:hover {
      color: $color-text;
      background-color: $color-bg-alt;
    }

    &--active {
      color: $color-primary-dark;
      background-color: rgba(66, 184, 131, 0.12);
      font-weight: 500;
    }
  }

  &__title {
    margin: 0;
    font-size: $font-size-xl;
    font-weight: 600;
    color: $color-text;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }

  &__loading,
  &__error {
    padding: $spacing-lg;
    text-align: center;
    color: $color-text-muted;
  }

  &__error {
    color: #dc2626;
  }
}
</style>
