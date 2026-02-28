<template>
  <div class="tasks-table">
    <div v-if="props.isLoading" class="tasks-table__loading">Завантаження...</div>
    <BaseTable
      v-else
      :columns="props.columns"
      :data="props.tasks"
      :sort-key="props.sortKey ?? undefined"
      :sort-dir="props.sortDir"
      :toolbar="props.toolbar"
      :search="props.search"
      :filters="props.filters"
      row-key="id"
      striped
      bordered
      draggable
      @sort="emit('sort', $event)"
      @update:column-width="(key, width) => emit('update:column-width', key, width)"
      @reorder="(fromIndex, toIndex) => emit('reorder', fromIndex, toIndex)"
      @update:search="emit('update:search', $event)"
      @update:filter="(key, value) => emit('update:filter', key, value)"
      @add="emit('add')"
    >
      <template #empty>
        <div class="tasks-table__empty">
          <p class="tasks-table__empty-text">Таблиця порожня. Додайте перше завдання.</p>
          <UiButton class="tasks-table__empty-action" @click="emit('add')">
            Додати завдання
          </UiButton>
        </div>
      </template>
      <template #cell-dueDate="{ value }">
        {{ formatDate(value) }}
      </template>
      <template #cell-status="{ value }">
        {{ value }}
      </template>
      <template #cell-actions="{ row }">
        <div class="tasks-table__actions">
          <button
            type="button"
            class="tasks-table__action tasks-table__action--edit"
            title="Редагувати"
            aria-label="Редагувати завдання"
            @click="emit('edit', row)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            class="tasks-table__action tasks-table__action--delete"
            title="Видалити"
            aria-label="Видалити завдання"
            @click="emit('delete', row)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </template>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
import BaseTable from '@/components/shared/BaseTable.vue'
import UiButton from '@/components/ui/UiButton.vue'
import type { Task, ToolbarConfig } from '@/types'
import type { BaseTableColumn } from '@/components/shared/BaseTable.vue'

interface Props {
  tasks: Task[]
  columns: BaseTableColumn<Task>[]
  isLoading: boolean
  sortKey?: string | null | undefined
  sortDir: 'asc' | 'desc'
  toolbar?: ToolbarConfig | null
  search?: string
  filters?: Record<string, string | number | undefined>
}

const props = withDefaults(defineProps<Props>(), {
  toolbar: undefined,
  search: '',
  filters: undefined,
})

const emit = defineEmits<{
  (e: 'sort', columnKey: string): void
  (e: 'update:column-width', columnKey: string, width: number): void
  (e: 'add'): void
  (e: 'edit', task: Task): void
  (e: 'delete', task: Task): void
  (e: 'reorder', fromIndex: number, toIndex: number): void
  (e: 'update:search', value: string): void
  (e: 'update:filter', key: string, value: string | number): void
}>()

function formatDate(value: unknown): string {
  if (value == null) return '—'
  const str = String(value)
  try {
    const d = new Date(str)
    return Number.isNaN(d.getTime()) ? str : d.toLocaleDateString()
  } catch {
    return str
  }
}
</script>

<style scoped lang="scss">
.tasks-table {
  &__loading {
    padding: $spacing-lg;
    text-align: center;
    color: $color-text-muted;
  }

  &__empty {
    padding: $spacing-md 0;
  }

  &__empty-text {
    margin: 0 0 $spacing-md;
    font-size: $font-size-base;
    color: $color-text-muted;
  }

  &__empty-action {
    margin-top: $spacing-sm;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
  }

  &__action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-xs;
    color: $color-text-muted;
    background: none;
    border: none;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: color 0.15s, background-color 0.15s;

    &:hover {
      color: $color-primary;
      background-color: $color-bg-alt;
    }

    &--delete:hover {
      color: #dc2626;
    }
  }
}
</style>
