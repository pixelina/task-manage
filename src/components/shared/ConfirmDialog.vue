<template>
  <UiModal
    :model-value="props.modelValue"
    :title="props.title"
    :close-on-overlay="!props.loading"
    @update:model-value="emit('update:modelValue', $event)"
    @close="onCancel"
  >
    <p class="confirm-dialog__message">{{ props.message }}</p>
    <template #footer>
      <div class="confirm-dialog__actions">
        <UiButton variant="ghost" :disabled="props.loading" @click="onCancel">
          {{ props.cancelLabel }}
        </UiButton>
        <UiButton
          :variant="props.variant"
          :loading="props.loading"
          @click="onConfirm"
        >
          {{ props.confirmLabel }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import UiModal from '@/components/ui/UiModal.vue'
import UiButton from '@/components/ui/UiButton.vue'

interface Props {
  modelValue: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'primary' | 'danger'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirm',
  confirmLabel: 'OK',
  cancelLabel: 'Cancel',
  variant: 'primary',
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function onConfirm() {
  if (props.loading) return
  emit('confirm')
  emit('update:modelValue', false)
}

function onCancel() {
  if (props.loading) return
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
.confirm-dialog {
  &__message {
    margin: 0;
    font-size: $font-size-base;
    color: $color-text;
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-sm;
  }
}
</style>
