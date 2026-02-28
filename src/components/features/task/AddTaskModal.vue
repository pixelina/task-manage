<template>
  <UiModal
    :model-value="props.modelValue"
    :title="isEditMode ? 'Редагувати завдання' : 'Додати завдання'"
    @update:model-value="emit('update:modelValue', $event)"
    @close="close"
  >
    <form class="add-task-modal" @submit.prevent="submit">
      <UiInput
        v-model="title"
        label="Назва"
        placeholder="Назва завдання"
        :error="error"
        required
      />
      <UiInput
        v-model="assignee"
        label="Виконавець"
        placeholder="Виконавець (необовʼязково)"
        type="text"
      />
      <UiSelect
        v-model="status"
        label="Статус"
        :options="statusOptions"
      />
      <UiInput
        v-model="dueDate"
        label="Термін виконання"
        type="date"
      />
      <div class="add-task-modal__actions">
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
import { ref, watch, computed } from 'vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiSelect from '@/components/ui/UiSelect.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { useTasksStore } from '@/store/tasks.store'
import type { Task, TaskStatus } from '@/types'
import type { SelectOption } from '@/components/ui/UiSelect.vue'

const TASK_STATUSES: TaskStatus[] = ['To do', 'In progress', 'Done']

const statusOptions = computed<SelectOption[]>(() =>
  TASK_STATUSES.map((s) => ({ value: s, label: s }))
)

interface Props {
  modelValue: boolean
  projectId: number
  task?: Task | null
}

const props = withDefaults(defineProps<Props>(), {
  task: null,
})

const isEditMode = computed(() => props.task != null)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const store = useTasksStore()

const title = ref('')
const assignee = ref('')
const status = ref<TaskStatus>('To do')
const dueDate = ref('')
const error = ref('')
const isLoading = ref(false)

function getDefaultDueDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

function formatDateForInput(value: string | undefined): string {
  if (!value) return getDefaultDueDate()
  try {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? getDefaultDueDate() : d.toISOString().slice(0, 10)
  } catch {
    return getDefaultDueDate()
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.task) {
        title.value = props.task.title
        assignee.value = props.task.assignee ?? ''
        status.value = props.task.status
        dueDate.value = formatDateForInput(props.task.dueDate)
      } else {
        title.value = ''
        assignee.value = ''
        status.value = 'To do'
        dueDate.value = getDefaultDueDate()
      }
      error.value = ''
    }
  }
)

async function submit() {
  const trimmed = title.value.trim()
  if (!trimmed) {
    error.value = 'Назва обовʼязкова'
    return
  }
  error.value = ''
  isLoading.value = true
  try {
    if (isEditMode.value && props.task) {
      await store.updateTask(props.task.id, {
        title: trimmed,
        assignee: assignee.value.trim() || undefined,
        status: status.value,
        dueDate: dueDate.value || new Date().toISOString().slice(0, 10),
      })
    } else {
      const tasksInProject = store.getTasksForProject(props.projectId)
      const order = tasksInProject.length
      await store.createTask({
        projectId: props.projectId,
        title: trimmed,
        assignee: assignee.value.trim() || undefined,
        status: status.value,
        dueDate: dueDate.value || new Date().toISOString().slice(0, 10),
        order,
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
.add-task-modal {
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
