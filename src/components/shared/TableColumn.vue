<template>
  <th
    class="table-column"
    :class="[`table-column--${props.align}`]"
    :style="{
      width: props.width != null ? `${props.width}px` : undefined,
      minWidth: props.minWidth != null ? `${props.minWidth}px` : undefined,
    }"
  >
    <slot />
  </th>
</template>

<script setup lang="ts">
interface Props {
  width?: number
  minWidth?: number
  align?: 'left' | 'right' | 'center'
}

const props = withDefaults(defineProps<Props>(), {
  align: 'left',
})
</script>

<style scoped lang="scss">
.table-column {
  padding: $spacing-sm $spacing-md;
  font-weight: 600;
  text-align: left;
  color: $color-text;
  background-color: $color-bg-alt;
  border: 1px solid $color-border;

  &--left {
    text-align: left;
  }

  &--right {
    text-align: right;
  }

  &--center {
    text-align: center;
  }
}
</style>
