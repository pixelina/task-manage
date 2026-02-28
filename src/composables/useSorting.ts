import { ref, computed } from 'vue'

export type SortDirection = 'asc' | 'desc'

export interface UseSortingOptions<T> {
  data: () => T[]
  sortKey?: keyof T | string | null
  sortDir?: SortDirection
  keys?: (keyof T | string)[]
  compare?: (a: T, b: T, key: keyof T | string, dir: SortDirection) => number
  /** When sortKey is null, use this order instead of raw data order. */
  getDefaultOrder?: (data: T[]) => T[]
}

function getSortValue<T extends Record<string, unknown>>(obj: T, key: string): unknown {
  return obj[key]
}

function defaultCompare<T extends Record<string, unknown>>(a: T, b: T, key: keyof T | string, dir: SortDirection): number {
  const k = String(key)
  const va = getSortValue(a, k)
  const vb = getSortValue(b, k)
  if (va == null && vb == null) return 0
  if (va == null) return dir === 'asc' ? 1 : -1
  if (vb == null) return dir === 'asc' ? -1 : 1
  if (typeof va === 'string' && typeof vb === 'string') {
    const cmp = va.localeCompare(vb)
    return dir === 'asc' ? cmp : -cmp
  }
  if (typeof va === 'number' && typeof vb === 'number') {
    const cmp = va - vb
    return dir === 'asc' ? cmp : -cmp
  }
  const cmp = String(va).localeCompare(String(vb))
  return dir === 'asc' ? cmp : -cmp
}

export function useSorting<T extends Record<string, unknown>>(options: UseSortingOptions<T>) {
  const sortKey = ref<keyof T | string | null>(
    options.sortKey !== undefined && options.sortKey !== null ? options.sortKey : null
  )
  const sortDir = ref<SortDirection>(options.sortDir ?? 'asc')

  const sortedData = computed(() => {
    const data = options.data()
    const key = sortKey.value
    if (key === null) {
      return options.getDefaultOrder ? options.getDefaultOrder(data) : [...data]
    }
    const list = [...data]
    const dir = sortDir.value
    const compare = options.compare ?? defaultCompare
    list.sort((a, b) => compare(a, b, key, dir))
    return list
  })

  function setSort(key: keyof T | string | null, dir?: SortDirection) {
    sortKey.value = key
    if (dir != null) sortDir.value = dir
  }

  /** Cycle: default → asc → desc → default. */
  function toggleSort(key: keyof T | string) {
    if (sortKey.value !== key) {
      sortKey.value = key
      sortDir.value = 'asc'
    } else if (sortDir.value === 'asc') {
      sortDir.value = 'desc'
    } else {
      sortKey.value = null
    }
  }

  function resetSort() {
    sortKey.value = null
  }

  return {
    sortKey,
    sortDir,
    sortedData,
    setSort,
    toggleSort,
    resetSort,
  }
}
