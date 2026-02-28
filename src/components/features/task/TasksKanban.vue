<template>
  <div class="tasks-kanban">
    <BaseToolbar
      v-if="props.toolbar"
      :toolbar="props.toolbar"
      @add="emit('add')"
    />
    <div v-if="props.isLoading" class="tasks-kanban__loading">Завантаження...</div>
    <div v-else class="tasks-kanban__board">
      <div
        v-for="col in props.columns"
        :key="col.id"
        class="tasks-kanban__column"
      >
        <h3 class="tasks-kanban__column-title">{{ col.title }}</h3>
        <div class="tasks-kanban__column-content">
          <draggable
            v-model="columnLists[col.id]"
            :group="{ name: 'tasks', pull: true, put: true }"
            item-key="id"
            class="tasks-kanban__list"
            @change="columnChangeHandler(col.id)"
            @add="(e: unknown) => onAdd(col.id, e)"
            @remove="(e: unknown) => onRemove(col.id, e)"
          >
            <template #item="{ element }">
              <div class="tasks-kanban__card">
                <div class="tasks-kanban__card-body">
                  <div class="tasks-kanban__card-title">{{ element.title }}</div>
                  <div v-if="element.assignee" class="tasks-kanban__card-assignee">
                    {{ element.assignee }}
                  </div>
                  <div class="tasks-kanban__card-due">
                    Дедлайн: {{ formatDate(element.dueDate) }}
                  </div>
                </div>
                <div class="tasks-kanban__card-actions">
                  <button
                    type="button"
                    class="tasks-kanban__card-action tasks-kanban__card-action--edit"
                    title="Редагувати"
                    aria-label="Редагувати завдання"
                    @click.stop="emit('edit', element)"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="tasks-kanban__card-action tasks-kanban__card-action--delete"
                    title="Видалити"
                    aria-label="Видалити завдання"
                    @click.stop="emit('delete', element)"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import type { Task, ToolbarConfig } from '@/types'
import type { KanbanColumn } from '@/components/shared/BaseKanban.vue'
import BaseToolbar from '@/components/shared/BaseToolbar.vue'

interface Props {
  columns: KanbanColumn[]
  itemsByColumnId: Record<string, Task[]>
  isLoading: boolean
  /** When set, shows toolbar with add button only (no search/filters). */
  toolbar?: ToolbarConfig | null
}

const props = withDefaults(defineProps<Props>(), {
  toolbar: undefined,
})

const emit = defineEmits<{
  (e: 'move', payload: { item: Task; fromColumnId: string; toColumnId: string; fromIndex: number; toIndex: number }): void
  (e: 'reorder', payload: { columnId: string; fromIndex: number; toIndex: number }): void
  (e: 'edit', task: Task): void
  (e: 'delete', task: Task): void
  (e: 'add'): void
}>()

const columnLists = ref<Record<string, Task[]>>({
  'To do': [],
  'In progress': [],
  'Done': [],
})

const pendingRemove = ref<{ item: Task; fromColumnId: string; fromIndex: number } | null>(null)
const pendingAdd = ref<{ item: Task; toColumnId: string; toIndex: number } | null>(null)

watch(
  () => props.itemsByColumnId,
  (val) => {
    columnLists.value = {
      'To do': [...(val['To do'] ?? [])],
      'In progress': [...(val['In progress'] ?? [])],
      'Done': [...(val['Done'] ?? [])],
    }
  },
  { deep: true, immediate: true }
)

interface ColumnChangeEvt {
  added?: { element: Task; newIndex: number }
  removed?: { element: Task; oldIndex: number }
  moved?: { oldIndex: number; newIndex: number }
}

function getSortablePayload(e: unknown): Record<string, unknown> | null {
  if (e == null || typeof e !== 'object') return null
  if ('detail' in e && e.detail != null && typeof e.detail === 'object') return e.detail as Record<string, unknown>
  return e as Record<string, unknown>
}

function isTaskLike(obj: unknown): obj is Task {
  if (obj == null || typeof obj !== 'object') return false
  if (!('id' in obj) || !('title' in obj)) return false
  return typeof obj.id === 'number'
}

function getTaskFromSortableEvt(e: unknown): Task | null {
  const payload = getSortablePayload(e)
  const item = payload?.item
  if (!item || typeof item !== 'object') return null
  const task = item && '_underlying_vm_' in item ? (item as { _underlying_vm_?: unknown })._underlying_vm_ : item
  return isTaskLike(task) ? task : null
}

function getSortableNumber(evt: Record<string, unknown>, key: 'oldIndex' | 'newIndex'): number {
  const n = evt[key]
  return typeof n === 'number' ? n : 0
}

function getIndexFromSortableEvt(e: unknown, key: 'oldIndex' | 'newIndex'): number {
  const evt = getSortablePayload(e)
  return evt ? getSortableNumber(evt, key) : 0
}

function onAdd(toColumnId: string, e: unknown) {
  const task = getTaskFromSortableEvt(e)
  const toIndex = getIndexFromSortableEvt(e, 'newIndex')
  if (!task) return
  if (pendingRemove.value?.item.id === task.id) {
    emit('move', {
      item: task,
      fromColumnId: pendingRemove.value.fromColumnId,
      toColumnId,
      fromIndex: pendingRemove.value.fromIndex,
      toIndex,
    })
    pendingRemove.value = null
  } else {
    pendingAdd.value = { item: task, toColumnId, toIndex }
  }
}

function onRemove(fromColumnId: string, e: unknown) {
  const task = getTaskFromSortableEvt(e)
  const fromIndex = getIndexFromSortableEvt(e, 'oldIndex')
  if (!task) return
  if (pendingAdd.value?.item.id === task.id) {
    emit('move', {
      item: task,
      fromColumnId,
      toColumnId: pendingAdd.value.toColumnId,
      fromIndex,
      toIndex: pendingAdd.value.toIndex,
    })
    pendingAdd.value = null
  } else {
    pendingRemove.value = { item: task, fromColumnId, fromIndex }
  }
}

function columnChangeHandler(columnId: string) {
  return (evt: ColumnChangeEvt) => onColumnChange(columnId, evt)
}

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

function onColumnChange(columnId: string, evt: ColumnChangeEvt) {
  if (evt.moved) {
    emit('reorder', {
      columnId,
      fromIndex: evt.moved.oldIndex,
      toIndex: evt.moved.newIndex,
    })
  }
}
</script>

<style scoped lang="scss">
.tasks-kanban {
  &__loading {
    padding: $spacing-lg;
    text-align: center;
    color: $color-text-muted;
  }

  &__board {
    display: flex;
    gap: $spacing-lg;
    overflow-x: auto;
    padding-bottom: $spacing-md;
    width: 100%;
  }

  &__column {
    flex: 1 1 0;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    min-height: 200px;
    background-color: $color-bg-alt;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    overflow: hidden;
  }

  &__column-title {
    margin: 0;
    padding: $spacing-md;
    font-size: $font-size-base;
    font-weight: 600;
    color: $color-text;
    background-color: $color-bg;
    border-bottom: 1px solid $color-border;
  }

  &__column-content {
    flex: 1;
    padding: $spacing-sm;
    overflow-y: auto;
  }

  &__list {
    min-height: 40px;
    height: 100%;
  }

  &__card {
    margin-bottom: $spacing-sm;
    padding: $spacing-md;
    background-color: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: grab;
    transition: box-shadow 0.15s;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: $spacing-sm;

    &:active {
      cursor: grabbing;
    }

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
  }

  &__card-body {
    flex: 1;
    min-width: 0;
  }

  &__card-title {
    font-weight: 500;
    color: $color-text;
    margin-bottom: $spacing-xs;
  }

  &__card-assignee {
    font-size: $font-size-sm;
    color: $color-text-muted;
    margin-bottom: $spacing-xs;
  }

  &__card-due {
    font-size: $font-size-sm;
    color: $color-text-muted;
  }

  &__card-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }

  &__card-action {
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
