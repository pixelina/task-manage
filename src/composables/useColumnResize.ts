import { ref, watch } from 'vue'
import { useLocalStorageSync } from './useLocalStorageSync'

export interface UseColumnResizeOptions {
  columnKeys: string[]
  defaultWidth?: number
  minWidth?: number
  storageKey?: string
}

export function useColumnResize(options: UseColumnResizeOptions) {
  const defaultWidth = options.defaultWidth ?? 120
  const minWidth = options.minWidth ?? 60

  const initialWidths: Record<string, number> = {}
  for (const key of options.columnKeys) {
    initialWidths[key] = defaultWidth
  }

  const columnWidths = options.storageKey
    ? useLocalStorageSync<Record<string, number>>(options.storageKey, initialWidths)
    : ref<Record<string, number>>(initialWidths)

  if (options.storageKey) {
    watch(
      () => options.columnKeys,
      (keys) => {
        const current = columnWidths.value
        const next = { ...current }
        for (const key of keys) {
          if (next[key] == null) next[key] = defaultWidth
        }
        columnWidths.value = next
      },
      { immediate: true }
    )
  }

  function getWidth(key: string): number {
    return columnWidths.value[key] ?? defaultWidth
  }

  function setWidth(key: string, width: number) {
    const next = { ...columnWidths.value }
    next[key] = Math.max(minWidth, width)
    columnWidths.value = next
  }

  function getColumnsWithWidths<T extends { key: string; label: string; minWidth?: number }>(
    columns: T[]
  ): (T & { width: number })[] {
    return columns.map((col) => ({
      ...col,
      width: getWidth(col.key),
      minWidth: col.minWidth ?? minWidth,
    }))
  }

  return {
    columnWidths,
    getWidth,
    setWidth,
    getColumnsWithWidths,
  }
}
