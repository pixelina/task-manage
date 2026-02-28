import { ref, computed } from 'vue'

export type FilterValues = Record<string, string | number | undefined>

export interface UseFilteringOptions<T> {
  data: () => T[]
  searchKeys?: (keyof T | string)[]
  searchTerm?: string
  filters?: FilterValues
  predicate?: (item: T, search: string, filters: FilterValues) => boolean
}

function getItemValue(item: Record<string, unknown>, key: string): unknown {
  return Object.prototype.hasOwnProperty.call(item, key) ? item[key] : undefined
}

function defaultPredicate<T extends Record<string, unknown>>(
  item: T,
  search: string,
  searchKeys: (keyof T | string)[],
  filters: FilterValues
): boolean {
  const s = search.trim().toLowerCase()
  if (s) {
    const matchesSearch = searchKeys.some((k) => {
      const v = getItemValue(item, String(k))
      return v != null && String(v).toLowerCase().includes(s)
    })
    if (!matchesSearch) return false
  }
  for (const [key, filterValue] of Object.entries(filters)) {
    if (filterValue == null || filterValue === '') continue
    const itemValue = getItemValue(item, key)
    const f = String(filterValue).toLowerCase()
    const v = itemValue != null ? String(itemValue).toLowerCase() : ''
    if (v !== f) return false
  }
  return true
}

export function useFiltering<T extends Record<string, unknown>>(options: UseFilteringOptions<T>) {
  const searchTerm = ref(options.searchTerm ?? '')
  const filters = ref<FilterValues>(options.filters ?? {})

  const filteredData = computed(() => {
    const list = options.data()
    const search = searchTerm.value
    const f = filters.value
    const keys = options.searchKeys ?? []
    const predicate =
      options.predicate ??
      ((item: T, s: string, filt: FilterValues) =>
        defaultPredicate(item, s, keys, filt))
    return list.filter((item) => predicate(item, search, f))
  })

  function setSearch(value: string) {
    searchTerm.value = value
  }

  function setFilter(key: string, value: string | number) {
    const next = { ...filters.value }
    if (value == null || value === '') {
      delete next[key]
    } else {
      next[key] = value
    }
    filters.value = next
  }

  function clearFilters() {
    searchTerm.value = ''
    filters.value = {}
  }

  return {
    searchTerm,
    filters,
    filteredData,
    setSearch,
    setFilter,
    clearFilters,
  }
}
