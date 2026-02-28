<template>
  <div class="ui-dropdown" :class="[`ui-dropdown--align-${props.align}`]">
    <button
      type="button"
      class="ui-dropdown__trigger"
      aria-haspopup="listbox"
      :aria-expanded="props.modelValue"
      @click="toggle"
    >
      <slot name="trigger">
        {{ props.triggerLabel }}
      </slot>
    </button>
    <Transition name="ui-dropdown">
      <div
        v-show="props.modelValue"
        class="ui-dropdown__panel"
        role="listbox"
        @click.stop
      >
        <slot name="default" :close="close" :on-select="onItemSelect" />
      </div>
    </Transition>
    <div
      v-show="props.modelValue"
      class="ui-dropdown__backdrop"
      aria-hidden="true"
      @click="close"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean
  triggerLabel?: string
  align?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  triggerLabel: '',
  align: 'left',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', value: unknown): void
}>()

function toggle() {
  emit('update:modelValue', !props.modelValue)
}

function close() {
  emit('update:modelValue', false)
}

function onItemSelect(value: unknown) {
  emit('select', value)
  close()
}
</script>

<style scoped lang="scss">
.ui-dropdown {
  position: relative;
  display: inline-block;

  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
    min-height: $control-height;
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-base;
    color: $color-text;
    background-color: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;
    box-sizing: border-box;
    transition: border-color 0.15s;

    &:hover {
      border-color: $color-primary;
    }
  }

  &__panel {
    position: absolute;
    z-index: 100;
    min-width: 160px;
    margin-top: $spacing-xs;
    padding: $spacing-xs;
    background-color: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &--align-left .ui-dropdown__panel {
    left: 0;
  }

  &--align-right .ui-dropdown__panel {
    right: 0;
  }

  &__backdrop {
    position: fixed;
    inset: 0;
    z-index: 99;
  }
}

.ui-dropdown-enter-active,
.ui-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.ui-dropdown-enter-from,
.ui-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
