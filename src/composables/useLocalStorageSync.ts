import { ref, watch } from 'vue'

const isClient = typeof window !== 'undefined'

function getStored<T>(key: string, defaultValue: T): T {
  if (!isClient) return defaultValue
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return defaultValue
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

function setStored<T>(key: string, value: T): void {
  if (!isClient) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

/**
 * Ref that syncs with localStorage. Changes to the ref are persisted;
 * initial value is read from localStorage or defaultValue.
 */
export function useLocalStorageSync<T>(key: string, defaultValue: T) {
  const data = ref<T>(getStored(key, defaultValue))

  watch(
    data,
    (value) => {
      setStored(key, value)
    },
    { deep: true }
  )

  return data
}
