<template>
  <div class="ui-input">
    <label v-if="props.label" class="ui-input__label" :for="props.label">
      {{ props.label }}
    </label>
    <input
      :id="props.label"
      class="ui-input__field"
      :class="{ 'ui-input__field--error': props.error }"
      :type="props.type"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :readonly="props.readonly"
      @input="onInput"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
    <span v-if="props.error" class="ui-input__error">{{ props.error }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  type?: 'text' | 'email' | 'password' | 'number' | 'date'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  label?: string
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  label: '',
  error: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}>()

function onInput(event: Event) {
  const target = event.target
  if (target instanceof HTMLInputElement) {
    emit('update:modelValue', target.value)
  }
}
</script>

<style scoped lang="scss">
.ui-input {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;

  &__label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $color-text;
  }

  &__field {
    min-height: $control-height;
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-base;
    line-height: 1.5;
    color: $color-text;
    background-color: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    outline: none;
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
