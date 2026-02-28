<template>
  <div class="ui-select">
    <label v-if="props.label" class="ui-select__label" :for="labelId">
      {{ props.label }}
    </label>
    <div class="ui-select__wrapper">
      <button
        :id="labelId"
        type="button"
        class="ui-select__field"
        :class="{
          'ui-select__field--error': props.error,
          'ui-select__field--open': isOpen,
        }"
        :disabled="props.disabled"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        :aria-label="props.label || 'Виберіть опцію'"
        @click="toggle"
      >
        <span class="ui-select__value">
          {{ displayLabel }}
        </span>
        <span class="ui-select__icon" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
      <Transition name="ui-select-dropdown">
        <div
          v-show="isOpen"
          class="ui-select__dropdown"
          role="listbox"
          tabindex="-1"
        >
          <button
            v-if="props.placeholder"
            type="button"
            class="ui-select__option"
            :class="{ 'ui-select__option--selected': selectedValue === '' }"
            role="option"
            :aria-selected="selectedValue === ''"
            @click="select('')"
          >
            {{ props.placeholder }}
          </button>
          <button
            v-for="opt in props.options"
            :key="String(opt.value)"
            type="button"
            class="ui-select__option"
            :class="{ 'ui-select__option--selected': isSelected(opt.value) }"
            role="option"
            :aria-selected="isSelected(opt.value)"
            @click="select(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </Transition>
      <div
        v-show="isOpen"
        class="ui-select__backdrop"
        aria-hidden="true"
        @click="close"
      />
    </div>
    <span v-if="props.error" class="ui-select__error">{{ props.error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface SelectOption {
  value: string | number
  label: string
}

interface Props {
  modelValue: string | number
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  label?: string
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
  label: '',
  error: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}>()

const labelId = computed(() => (props.label ? `ui-select-${props.label.replace(/\s/g, '-')}` : undefined))

const isOpen = ref(false)

const selectedValue = computed(() => props.modelValue)

const displayLabel = computed(() => {
  if (props.modelValue === '' || props.modelValue == null) return props.placeholder || '—'
  const opt = props.options.find((o) => String(o.value) === String(props.modelValue))
  return opt?.label ?? String(props.modelValue)
})

function isSelected(value: string | number): boolean {
  return String(value) === String(props.modelValue)
}

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function select(value: string | number) {
  const option = props.options.find((o) => String(o.value) === String(value))
  const parsed = option != null ? option.value : value
  emit('update:modelValue', parsed)
  emit('change', parsed)
  close()
}
</script>

<style scoped lang="scss">
.ui-select {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;

  &__label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $color-text;
  }

  &__wrapper {
    position: relative;
  }

  &__field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-sm;
    width: 100%;
    min-height: $control-height;
    padding: $spacing-sm $spacing-md $spacing-sm $spacing-md;
    padding-right: 2.25rem;
    font-size: $font-size-base;
    line-height: 1.5;
    color: $color-text;
    text-align: left;
    background-color: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    outline: none;
    cursor: pointer;
    box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:hover:not(:disabled) {
      border-color: $color-primary;
    }

    &:focus {
      border-color: $color-primary;
      box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
    }

    &:disabled {
      background-color: $color-bg-alt;
      cursor: not-allowed;
      color: $color-text-muted;
    }

    &--error {
      border-color: #dc2626;
    }

    &--open {
      border-color: $color-primary;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  &__value {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__icon {
    position: absolute;
    right: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-text-muted;
    pointer-events: none;
    transition: transform 0.2s ease;
  }

  &__field--open .ui-select__icon {
    transform: translateY(-50%) rotate(180deg);
  }

  &__dropdown {
    position: absolute;
    z-index: 100;
    left: 0;
    right: 0;
    margin-top: -1px;
    max-height: 240px;
    overflow-y: auto;
    background-color: $color-bg;
    border: 1px solid $color-primary;
    border-top: none;
    border-radius: 0 0 $radius-md $radius-md;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }

  &__option {
    display: block;
    width: 100%;
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-base;
    line-height: 1.5;
    color: $color-text;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.12s ease;

    &:hover {
      background-color: $color-bg-alt;
    }

    &:focus-visible {
      outline: none;
      background-color: $color-bg-alt;
    }

    &--selected {
      background-color: rgba(66, 184, 131, 0.12);
      color: $color-primary-dark;
      font-weight: 500;
    }

    &--selected:hover {
      background-color: rgba(66, 184, 131, 0.18);
    }
  }

  &__backdrop {
    position: fixed;
    inset: 0;
    z-index: 99;
  }

  &__error {
    font-size: $font-size-sm;
    color: #dc2626;
  }
}

.ui-select-dropdown-enter-active,
.ui-select-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.ui-select-dropdown-enter-from,
.ui-select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
