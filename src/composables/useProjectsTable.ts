import { computed, ref, watch } from 'vue'
import { useProjectsStore } from '@/store/projects.store'
import { useTasksStore } from '@/store/tasks.store'
import { useSorting } from './useSorting'
import { useFiltering } from './useFiltering'
import { useColumnResize } from './useColumnResize'
import type { Project } from '@/types'
import type { BaseTableColumn } from '@/components/shared/BaseTable.vue'

const PROJECTS_TABLE_STORAGE_KEY = 'task-manage-projects-table-column-widths'
const PROJECTS_ORDER_STORAGE_KEY = 'task-manage-projects-order'
const PROJECTS_COLUMN_KEYS = ['id', 'name', 'taskCount', 'status', 'createdAt', 'actions']

function loadProjectOrder(): number[] {
  try {
    const raw = localStorage.getItem(PROJECTS_ORDER_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x): x is number => typeof x === 'number') : []
  } catch {
    return []
  }
}

function saveProjectOrder(ids: number[]) {
  try {
    localStorage.setItem(PROJECTS_ORDER_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // ignore
  }
}

function applyOrder<T extends { id: number }>(data: T[], orderIds: number[]): T[] {
  if (orderIds.length === 0) return [...data]
  const byId = new Map(data.map((p) => [p.id, p]))
  const result: T[] = []
  const appended = new Set<number>()
  for (const id of orderIds) {
    const p = byId.get(id)
    if (p) {
      result.push(p)
      appended.add(id)
    }
  }
  for (const p of data) {
    if (!appended.has(p.id)) result.push(p)
  }
  return result
}

export function useProjectsTable() {
  const store = useProjectsStore()
  const tasksStore = useTasksStore()
  const projectOrderIds = ref<number[]>(loadProjectOrder())

  watch(
    () => store.projects.map((p) => p.id),
    (ids) => {
      if (projectOrderIds.value.length === 0 && ids.length > 0) {
        projectOrderIds.value = [...ids]
        saveProjectOrder(projectOrderIds.value)
      }
    },
    { immediate: true }
  )

  const tasksCountByProjectId = computed(() => {
    const map = new Map<number, number>()
    for (const t of tasksStore.tasks) {
      map.set(t.projectId, (map.get(t.projectId) ?? 0) + 1)
    }
    return map
  })

  const tableDataForSortFilter = computed(() => {
    return store.projects.map((p) => ({
      ...p,
      taskCount: tasksCountByProjectId.value.get(p.id) ?? 0,
    }))
  })

  const columnResize = useColumnResize({
    columnKeys: PROJECTS_COLUMN_KEYS,
    defaultWidth: 120,
    minWidth: 60,
    storageKey: PROJECTS_TABLE_STORAGE_KEY,
  })

  const filtering = useFiltering<Project & { taskCount?: number }>({
    data: () => tableDataForSortFilter.value,
    searchKeys: ['name'],
    predicate: (item, search, filters) => {
      const s = search.trim().toLowerCase()
      if (s && !String(item.name).toLowerCase().includes(s)) return false
      const status = filters.status
      if (status != null && status !== '' && item.status !== status) return false
      return true
    },
  })

  const sorting = useSorting<Project & { taskCount?: number }>({
    data: () => filtering.filteredData.value,
    keys: ['id', 'name', 'taskCount', 'status', 'createdAt'],
    sortKey: null,
    getDefaultOrder: (data) => applyOrder(data, projectOrderIds.value),
  })

  const filteredProjects = computed(() => sorting.sortedData.value)

  function moveProjectRow(fromIndex: number, toIndex: number) {
    const list = [...filteredProjects.value]
    const [item] = list.splice(fromIndex, 1)
    if (!item) return
    list.splice(toIndex, 0, item)
    projectOrderIds.value = list.map((p) => p.id)
    saveProjectOrder(projectOrderIds.value)
    sorting.resetSort()
  }

  const columns = computed<BaseTableColumn<Project & { taskCount?: number }>[]>(() =>
    columnResize.getColumnsWithWidths([
      { key: 'id', label: 'ID', align: 'center' as const },
      { key: 'name', label: 'Назва проекту', align: 'center' as const },
      { key: 'taskCount', label: 'Кількість завдань', align: 'center' as const },
      { key: 'status', label: 'Статус', align: 'center' as const },
      { key: 'createdAt', label: 'Дата створення', align: 'center' as const },
      { key: 'actions', label: 'Дії', align: 'center' as const, width: 100, sortable: false },
    ])
  )

  function onColumnResize(columnKey: string, width: number) {
    columnResize.setWidth(columnKey, width)
  }

  return {
    projects: filteredProjects,
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
    moveProjectRow,
    fetchProjects: store.fetchProjects,
  }
}
