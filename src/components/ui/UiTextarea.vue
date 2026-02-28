<template>
  <div class="ui-textarea">
    <label v-if="props.label" class="ui-textarea__label" :for="labelId">
      {{ props.label }}
    </label>
    <textarea
      :id="labelId"
      class="ui-textarea__field"
      :class="{ 'ui-textarea__field--error': props.error }"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :rows="props.rows"
      @input="onInput"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
    <span v-if="props.error" class="ui-textarea__error">{{ props.error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  label?: string
  error?: string
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
  readonly: false,
  label: '',
  error: '',
  rows: 3,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}>()

const labelId = computed(() =>
  props.label ? `ui-textarea-${props.label.replace(/\s/g, '-')}` : undefined
)

function onInput(event: Event) {
  if (event.target instanceof HTMLTextAreaElement) {
    emit('update:modelValue', event.target.value)
  }
}
</script>

<style scoped lang="scss">
.ui-textarea {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;

  &__label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $color-text;
  }

  &__field {
    min-height: calc(#{$control-height} * 2);
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-base;
    font-family: inherit;
    line-height: 1.5;
    color: $color-text;
    background-color: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    outline: none;
    resize: none;
    box-sizing: border-box;
    transition: border-color 0.15s;

    &::placeholder {
      color: $color-text-muted;
    }

    &:focus {
      border-color: $color-primary;
    }

    &:disabled,
    &:read-only {
      background-color: $color-bg-alt;
      cursor: default;
    }

    &--error {
      border-color: #dc2626;
    }
  }

  &__error {
    font-size: $font-size-sm;
    color: #dc2626;
  }
}
</style>
