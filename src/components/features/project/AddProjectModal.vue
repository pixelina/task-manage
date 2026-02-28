<template>
  <UiModal
    :model-value="props.modelValue"
    :title="isEditMode ? 'Редагувати проєкт' : 'Додати проєкт'"
    @update:model-value="emit('update:modelValue', $event)"
    @close="close"
  >
    <form class="add-project-modal" @submit.prevent="submit">
      <UiInput
        v-model="name"
        label="Назва"
        placeholder="Назва проєкту"
        :error="error"
        required
      />
      <UiTextarea
        v-model="description"
        label="Опис"
        placeholder="Опис (необовʼязково)"
        :rows="3"
      />
      <div class="add-project-modal__actions">
        <UiButton type="button" variant="ghost" :disabled="isLoading" @click="close">
          Скасувати
        </UiButton>
        <UiButton type="submit" :loading="isLoading">
          {{ isEditMode ? 'Зберегти зміни' : 'Зберегти' }}
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiTextarea from '@/components/ui/UiTextarea.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { useProjectsStore } from '@/store/projects.store'
import type { Project } from '@/types'

interface Props {
  modelValue: boolean
  project?: Project | null
}

const props = withDefaults(defineProps<Props>(), {
  project: null,
})

const isEditMode = computed(() => props.project != null)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const store = useProjectsStore()

const name = ref('')
const description = ref('')
const error = ref('')
const isLoading = ref(false)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.project) {
        name.value = props.project.name
        description.value = props.project.description ?? ''
      } else {
        name.value = ''
        description.value = ''
      }
      error.value = ''
    }
  }
)

async function submit() {
  const trimmed = name.value.trim()
  if (!trimmed) {
    error.value = 'Назва обовʼязкова'
    return
  }
  error.value = ''
  isLoading.value = true
  try {
    if (isEditMode.value && props.project) {
      await store.updateProject(props.project.id, {
        name: trimmed,
        description: description.value.trim() || undefined,
      })
    } else {
      await store.createProject({
        name: trimmed,
        description: description.value.trim() || undefined,
        status: 'active',
      })
    }
    emit('success')
    emit('update:modelValue', false)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Помилка збереження'
  } finally {
    isLoading.value = false
  }
}

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
.add-project-modal {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-sm;
    margin-top: $spacing-sm;
  }
}
</style>
