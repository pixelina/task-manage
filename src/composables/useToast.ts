import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref<ToastType>('info')
const toastDuration = ref(3000)

export function useToast() {
  function show(message: string, type: ToastType = 'info', duration = 3000) {
    toastMessage.value = message
    toastType.value = type
    toastDuration.value = duration
    toastVisible.value = true
  }

  function success(message: string, duration = 3000) {
    show(message, 'success', duration)
  }

  function error(message: string, duration = 3000) {
    show(message, 'error', duration)
  }

  function info(message: string, duration = 3000) {
    show(message, 'info', duration)
  }

  function warning(message: string, duration = 3000) {
    show(message, 'warning', duration)
  }

  function close() {
    toastVisible.value = false
  }

  return {
    visible: toastVisible,
    message: toastMessage,
    type: toastType,
    duration: toastDuration,
    show,
    success,
    error,
    info,
    warning,
    close,
  }
}
