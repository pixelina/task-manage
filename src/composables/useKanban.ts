import { computed, unref, type MaybeRef } from 'vue'
import { useTasksStore } from '@/store/tasks.store'
import { useLocalStorageSync } from './useLocalStorageSync'
import type { Task, TaskStatus } from '@/types'
import type { KanbanColumn } from '@/components/shared/BaseKanban.vue'

const VIEW_MODE_STORAGE_KEY = 'task-manage-view-mode-by-project'

export type ViewMode = 'table' | 'kanban'

function toTaskStatus(s: string): TaskStatus | null {
  if (s === 'To do' || s === 'In progress' || s === 'Done') return s
  return null
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'To do', title: 'To do' },
  { id: 'In progress', title: 'In progress' },
  { id: 'Done', title: 'Done' },
]

const viewModeByProject = useLocalStorageSync<Record<number, ViewMode>>(
  VIEW_MODE_STORAGE_KEY,
  {}
)

export function useKanban(projectIdRef: MaybeRef<number>) {
  const store = useTasksStore()

  const viewMode = computed<ViewMode>({
    get: () => viewModeByProject.value[unref(projectIdRef)] ?? 'table',
    set: (v: ViewMode) => {
      const id = unref(projectIdRef)
      const next = { ...viewModeByProject.value }
      next[id] = v
      viewModeByProject.value = next
    },
  })

  const tasks = computed(() => store.getTasksForProject(unref(projectIdRef)))

  const itemsByColumnId = computed<Record<string, Task[]>>(() => {
    const byStatus: Record<string, Task[]> = {
      'To do': [],
      'In progress': [],
      Done: [],
    }
    for (const task of tasks.value) {
      const list = byStatus[task.status] ?? []
      list.push(task)
      byStatus[task.status] = list
    }
    for (const list of Object.values(byStatus)) {
      list.sort((a, b) => a.order - b.order)
    }
    return byStatus
  })

  const columns = computed(() => KANBAN_COLUMNS)

  async function moveCard(
    item: Task,
    fromColumnId: string,
    toColumnId: string,
    toIndex: number
  ) {
    const newStatus = toTaskStatus(toColumnId)
    if (newStatus === null) return
    const targetList = itemsByColumnId.value[toColumnId] ?? []
    const reordered = [...targetList]
    if (item.status === newStatus) {
      const fromList = itemsByColumnId.value[fromColumnId] ?? []
      const fromIdx = fromList.findIndex((t) => t.id === item.id)
      if (fromIdx >= 0) {
        reordered.splice(fromIdx, 1)
        reordered.splice(toIndex, 0, item)
      }
    } else {
      reordered.splice(toIndex, 0, { ...item, status: newStatus })
    }
    const newOrder = reordered.findIndex((t) => t.id === item.id)
    const orderToSend = newOrder >= 0 ? newOrder : toIndex
    await store.updateTaskStatus(item.id, newStatus, orderToSend)
  }

  async function reorderInColumn(columnId: string, fromIndex: number, toIndex: number) {
    const list = [...(itemsByColumnId.value[columnId] ?? [])]
    const [item] = list.splice(fromIndex, 1)
    if (!item) return
    list.splice(toIndex, 0, item)
    for (const [i, task] of list.entries()) {
      if (task.order !== i) {
        await store.updateTaskOrder(task.id, i)
      }
    }
  }

  return {
    viewMode,
    columns,
    itemsByColumnId,
    tasks,
    moveCard,
    reorderInColumn,
    fetchTasks: () => store.fetchTasks(unref(projectIdRef)),
  }
}
