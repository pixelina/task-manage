import { computed, unref, type MaybeRef } from 'vue'
import { useTasksStore } from '@/store/tasks.store'
import { useSorting } from './useSorting'
import { useFiltering } from './useFiltering'
import { useColumnResize } from './useColumnResize'
import type { Task } from '@/types'
import type { BaseTableColumn } from '@/components/shared/BaseTable.vue'

const TASKS_TABLE_STORAGE_KEY = 'task-manage-tasks-table-column-widths'
const TASKS_COLUMN_KEYS = ['id', 'title', 'assignee', 'status', 'dueDate', 'actions']

export function useTasksTable(projectIdRef: MaybeRef<number>) {
  const store = useTasksStore()

  const columnResize = useColumnResize({
    columnKeys: TASKS_COLUMN_KEYS,
    defaultWidth: 120,
    minWidth: 60,
    storageKey: `${TASKS_TABLE_STORAGE_KEY}-${unref(projectIdRef)}`,
  })

  const tableData = computed(() => store.getTasksForProject(unref(projectIdRef)))

  const filtering = useFiltering<Task>({
    data: () => tableData.value,
    searchKeys: ['title', 'assignee'],
    predicate: (item, search, filters) => {
      const s = search.trim().toLowerCase()
      if (s) {
        const match =
          String(item.title).toLowerCase().includes(s) ||
          String(item.assignee ?? '').toLowerCase().includes(s)
        if (!match) return false
      }
      const status = filters.status
      if (status != null && status !== '' && item.status !== status) return false
      const assignee = filters.assignee
      if (assignee != null && assignee !== '' && (item.assignee ?? '') !== assignee) return false
      return true
    },
  })

  const sorting = useSorting<Task>({
    data: () => filtering.filteredData.value,
    keys: ['dueDate', 'status', 'id', 'title', 'assignee'],
    sortKey: null,
  })

  const filteredTasks = computed(() => sorting.sortedData.value)

  const columns = computed<BaseTableColumn<Task>[]>(() =>
    columnResize.getColumnsWithWidths([
      { key: 'id', label: 'ID', align: 'center' as const },
      { key: 'title', label: 'Назва', align: 'center' as const },
      { key: 'assignee', label: 'Виконавець', align: 'center' as const },
      { key: 'status', label: 'Статус', align: 'center' as const },
      { key: 'dueDate', label: 'Термін виконання', align: 'center' as const },
      { key: 'actions', label: 'Дії', align: 'center' as const, width: 100, sortable: false },
    ])
  )

  function onColumnResize(columnKey: string, width: number) {
    columnResize.setWidth(columnKey, width)
  }

  async function moveRow(taskId: number, fromIndex: number, toIndex: number) {
    const list = [...filteredTasks.value]
    const item = list[fromIndex]
    if (!item || item.id !== taskId) return
    list.splice(fromIndex, 1)
    list.splice(toIndex, 0, item)
    for (const [i, task] of list.entries()) {
      if (task.order !== i) {
        await store.updateTaskOrder(task.id, i)
      }
    }
    sorting.resetSort()
  }

  return {
    tasks: filteredTasks,
    columns,
    isLoading: computed(() => store.isLoading),
    error: computed(() => store.error),
    sortKey: sorting.sortKey,
    sortDir: sorting.sortDir,
    searchTerm: filtering.searchTerm,
    filters: filtering.filters,
    setSearch: filtering.setSearch,
    setFilter: filtering.setFilter,
    toggleSort: sorting.toggleSort,
    onColumnResize,
    moveRow,
    fetchTasks: () => store.fetchTasks(unref(projectIdRef)),
    updateTaskOrder: store.updateTaskOrder,
  }
}
