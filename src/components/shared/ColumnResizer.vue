<template>
  <th
    class="column-resizer"
    :class="[props.align && `column-resizer--${props.align}`]"
    :style="{ width: `${props.width}px`, minWidth: `${props.minWidth}px` }"
  >
    <slot />
    <span
      class="column-resizer__handle"
      role="separator"
      aria-orientation="vertical"
      tabindex="-1"
      @pointerdown="onPointerDown"
    />
  </th>
</template>

<script setup lang="ts">
interface Props {
  width?: number
  minWidth?: number
  align?: 'left' | 'center' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  width: 120,
  minWidth: 60,
  align: undefined,
})

const emit = defineEmits<{
  (e: 'update:width', width: number): void
}>()

let startX = 0
let startWidth = 0

function onPointerDown(event: PointerEvent) {
  event.preventDefault()
  startX = event.clientX
  startWidth = props.width
  if (event.target instanceof HTMLElement) {
    event.target.setPointerCapture?.(event.pointerId)
  }
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(event: PointerEvent) {
  const delta = event.clientX - startX
  const next = Math.max(props.minWidth, startWidth + delta)
  emit('update:width', next)
}

function onPointerUp() {
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', onPointerUp)
}
</script>

<style scoped lang="scss">
.column-resizer {
  position: relative;
  padding: $spacing-sm $spacing-md;
  font-weight: 600;
  text-align: left;
  color: $color-text;
  background-color: $color-bg-alt;
  border: 1px solid $color-border;
  user-select: none;

  &--center {
    text-align: center;
  }

  &--right {
    text-align: right;
  }

  &__handle {
    position: absolute;
    top: 0;
    right: 0;
    width: 6px;
    height: 100%;
    cursor: col-resize;

    &:hover,
    &:active {
      background-color: $color-primary;
      opacity: 0.3;
    }
  }
}
</style>
