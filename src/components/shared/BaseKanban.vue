<template>
  <div class="base-kanban">
    <div
      v-for="col in props.columns"
      :key="col.id"
      class="base-kanban__column"
    >
      <h3 class="base-kanban__column-title">{{ col.title }}</h3>
      <div class="base-kanban__column-content">
        <slot
          :name="`column-${col.id}`"
          :column="col"
          :items="getItemsForColumn(col.id)"
        >
          <div
            v-for="(item, index) in getItemsForColumn(col.id)"
            :key="getItemKey(item, index)"
            class="base-kanban__card-placeholder"
          >
            <slot name="card" :item="item" :column="col" :index="index" />
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface KanbanColumn {
  id: string
  title: string
}

interface Props<T = unknown> {
  columns: KanbanColumn[]
  itemsByColumnId: Record<string, T[]>
}

const props = defineProps<Props>()

defineEmits<{
  (e: 'move', payload: { item: unknown; fromColumnId: string; toColumnId: string; fromIndex: number; toIndex: number }): void
  (e: 'reorder', payload: { columnId: string; fromIndex: number; toIndex: number }): void
}>()

function getItemsForColumn(columnId: string): unknown[] {
  return props.itemsByColumnId[columnId] ?? []
}

function getItemKey(item: unknown, index: number): string | number {
  if (item == null || typeof item !== 'object' || !('id' in item)) return index
  const id = item.id
  if (typeof id === 'number') return id
  if (id != null) return String(id)
  return index
}
</script>

<style scoped lang="scss">
.base-kanban {
  display: flex;
  gap: $spacing-lg;
  overflow-x: auto;
  padding-bottom: $spacing-md;

  &__column {
    flex: 0 0 280px;
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

  &__card-placeholder {
    margin-bottom: $spacing-sm;
    padding: $spacing-md;
    background-color: $color-bg;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }
}
</style>
