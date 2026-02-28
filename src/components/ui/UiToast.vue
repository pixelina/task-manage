<template>
  <Teleport to="body">
    <Transition name="ui-toast">
      <div
        v-show="props.modelValue"
        class="ui-toast"
        :class="[`ui-toast--${props.type}`]"
        role="alert"
        aria-live="polite"
      >
        <span class="ui-toast__message">{{ props.message }}</span>
        <button
          type="button"
          class="ui-toast__close"
          aria-label="Close"
          @click="close"
        >
          ×
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'

interface Props {
  modelValue: boolean
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 0,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

function close() {
  emit('update:modelValue', false)
  emit('close')
}

let timeoutId: ReturnType<typeof setTimeout> | null = null

function startTimer() {
  if (timeoutId) clearTimeout(timeoutId)
  if (props.duration > 0 && props.modelValue) {
    timeoutId = setTimeout(() => {
      close()
      timeoutId = null
    }, props.duration)
  }
}

function clearTimer() {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

watch(
  () => [props.modelValue, props.duration] as const,
  () => startTimer(),
  { immediate: true }
)

onBeforeUnmount(clearTimer)
</script>

<style scoped lang="scss">
.ui-toast {
  position: fixed;
  bottom: $spacing-lg;
  left: 50%;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  max-width: 90vw;
  padding: $spacing-md $spacing-lg;
  font-size: $font-size-base;
  color: #fff;
  border-radius: $radius-md;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateX(-50%);

  &--success {
    background-color: $color-primary;
  }

  &--error {
    background-color: #dc2626;
  }

  &--info {
    background-color: $color-text-muted;
  }

  &--warning {
    background-color: #d97706;
  }

  &__message {
    flex: 1;
  }

  &__close {
    padding: 0 $spacing-xs;
    font-size: 1.25rem;
    line-height: 1;
    color: inherit;
    background: none;
    border: none;
    opacity: 0.8;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }
}

.ui-toast-enter-active,
.ui-toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.ui-toast-enter-from,
.ui-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
