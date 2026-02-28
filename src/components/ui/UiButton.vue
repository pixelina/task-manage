<template>
  <button
    :type="props.type"
    class="ui-button"
    :class="[
      `ui-button--${props.variant}`,
      { 'ui-button--disabled': props.disabled, 'ui-button--loading': props.loading },
    ]"
    :disabled="props.disabled || props.loading"
    @click="handleClick"
  >
    <span v-if="props.loading" class="ui-button__spinner" aria-hidden="true" />
    <span class="ui-button__content">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  disabled: false,
  loading: false,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) return
  emit('click', event)
}
</script>

<style scoped lang="scss">
.ui-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  min-height: $control-height;
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-base;
  font-weight: 500;
  line-height: 1.5;
  border: 1px solid transparent;
  border-radius: $radius-md;
  cursor: pointer;
  box-sizing: border-box;
  transition: background-color 0.15s, border-color 0.15s, opacity 0.15s;

  &--primary {
    color: #fff;
    background-color: $color-primary;
    border-color: $color-primary;

    &:hover:not(:disabled) {
      background-color: $color-primary-dark;
      border-color: $color-primary-dark;
    }
  }

  &--secondary {
    color: $color-text;
    background-color: $color-bg-alt;
    border-color: $color-border;

    &:hover:not(:disabled) {
      background-color: color.adjust($color-bg-alt, $lightness: -4%);
    }
  }

  &--ghost {
    color: $color-text;
    background-color: transparent;
    border-color: transparent;

    &:hover:not(:disabled) {
      background-color: $color-bg-alt;
    }
  }

  &--danger {
    color: #fff;
    background-color: #dc2626;
    border-color: #dc2626;

    &:hover:not(:disabled) {
      background-color: #b91c1c;
    }
  }

  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--loading .ui-button__content {
    visibility: hidden;
  }

  &__spinner {
    position: absolute;
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: ui-button-spin 0.6s linear infinite;
  }

  &__content {
    display: inline-flex;
    align-items: center;
    gap: inherit;
  }
}

@keyframes ui-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
