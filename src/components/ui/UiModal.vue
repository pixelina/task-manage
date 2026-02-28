<template>
  <Teleport to="body">
    <Transition name="ui-modal">
      <div
        v-show="props.modelValue"
        class="ui-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="title || undefined"
        @keydown.escape="onKeydown"
      >
        <div
          class="ui-modal__overlay"
          aria-hidden="true"
          @click="onOverlayClick"
        />
        <div class="ui-modal__box" @click.stop>
          <header v-if="title || $slots.header" class="ui-modal__header">
            <slot name="header">
              <h2 class="ui-modal__title">{{ title }}</h2>
            </slot>
            <button
              type="button"
              class="ui-modal__close"
              aria-label="Close"
              @click="close"
            >
              ×
            </button>
          </header>
          <div class="ui-modal__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="ui-modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  closeOnOverlay: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onOverlayClick() {
  if (props.closeOnOverlay) close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}
</script>

<style scoped lang="scss">
.ui-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;

  &__overlay {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }

  &__box {
    position: relative;
    width: 100%;
    max-width: 480px;
    max-height: 90vh;
    overflow: auto;
    background-color: $color-bg;
    border-radius: $radius-lg;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-md;
    padding: $spacing-md $spacing-lg;
    border-bottom: 1px solid $color-border;
  }

  &__title {
    margin: 0;
    font-size: $font-size-lg;
    font-weight: 600;
    color: $color-text;
  }

  &__close {
    padding: $spacing-xs $spacing-sm;
    font-size: 1.5rem;
    line-height: 1;
    color: $color-text-muted;
    background: none;
    border: none;
    border-radius: $radius-sm;
    cursor: pointer;

    &:hover {
      color: $color-text;
      background-color: $color-bg-alt;
    }
  }

  &__body {
    padding: $spacing-lg;
  }

  &__footer {
    padding: $spacing-md $spacing-lg;
    border-top: 1px solid $color-border;
  }
}

.ui-modal-enter-active,
.ui-modal-leave-active {
  transition: opacity 0.2s ease;

  .ui-modal__box {
    transition: transform 0.2s ease;
  }
}

.ui-modal-enter-from,
.ui-modal-leave-to {
  opacity: 0;

  .ui-modal__box {
    transform: scale(0.95);
  }
}
</style>
