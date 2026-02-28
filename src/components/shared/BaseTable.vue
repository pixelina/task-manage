<template>
  <div class="base-table">
    <BaseToolbar
      v-if="props.toolbar"
      :toolbar="props.toolbar"
      :search="props.search"
      :filters="props.filters"
      @update:search="emit('update:search', $event)"
      @update:filter="(key, value) => emit('update:filter', key, value)"
      @add="emit('add')"
    />
    <UiTable
      :striped="props.striped"
      :bordered="props.bordered"
      :no-body-wrap="!!props.draggable"
    >
      <template #header>
        <tr>
          <ColumnResizer
            v-for="col in props.columns"
            :key="String(col.key)"
            :width="col.width ?? 120"
            :min-width="col.minWidth ?? 60"
            :align="col.align"
            @update:width="(w) => onResize(String(col.key), w)"
          >
            <span
              v-if="col.sortable !== false"
              class="base-table__sort-header"
              role="button"
              tabindex="0"
              @click="emit('sort', String(col.key))"
              @keydown.enter.space.prevent="emit('sort', String(col.key))"
            >
              {{ col.label }}
              <span
                v-if="props.sortKey != null && props.sortKey === col.key"
                class="base-table__sort-icon"
                aria-hidden="true"
              >
                {{ props.sortDir === "asc" ? "↑" : "↓" }}
              </span>
            </span>
            <template v-else>{{ col.label }}</template>
          </ColumnResizer>
        </tr>
      </template>
      <template v-if="props.draggable && internalList.length > 0">
        <draggable
          tag="tbody"
          class="base-table__body"
          :list="internalList"
          :item-key="rowKeyStr"
          handle=".base-table__drag-handle"
          ghost-class="base-table__row--ghost"
          @change="onDragChange"
        >
          <template #item="{ element }">
            <tr class="base-table__row">
              <td
                v-for="(col, colIndex) in props.columns"
                :key="String(col.key)"
                class="base-table__cell"
                :class="[
                  `base-table__cell--${col.align ?? 'left'}`,
                  {
                    'base-table__cell--first-draggable':
                      props.draggable && colIndex === 0,
                  },
                ]"
                :style="{
                  width: col.width ? `${col.width}px` : undefined,
                  minWidth: col.minWidth ? `${col.minWidth}px` : undefined,
                }"
              >
                <span
                  v-if="props.draggable && colIndex === 0"
                  class="base-table__drag-handle"
                  aria-label="Перетягнути"
                >
                  <span class="base-table__drag-handle-icon">⋮⋮</span>
                </span>
                <slot
                  :name="`cell-${String(col.key)}`"
                  :row="element"
                  :column="col"
                  :value="getCellValue(element, String(col.key))"
                  :index="internalList.indexOf(element)"
                >
                  {{ getCellValue(element, String(col.key)) }}
                </slot>
              </td>
            </tr>
          </template>
        </draggable>
      </template>
      <template v-else-if="props.data.length">
        <tr v-for="(row, rowIndex) in props.data" :key="getRowKey(row)">
          <td
            v-for="col in props.columns"
            :key="String(col.key)"
            class="base-table__cell"
            :class="[`base-table__cell--${col.align ?? 'left'}`]"
            :style="{
              width: col.width ? `${col.width}px` : undefined,
              minWidth: col.minWidth ? `${col.minWidth}px` : undefined,
            }"
          >
            <slot
              :name="`cell-${String(col.key)}`"
              :row="row"
              :column="col"
              :value="getCellValue(row, String(col.key))"
              :index="rowIndex"
            >
              {{ getCellValue(row, String(col.key)) }}
            </slot>
          </td>
        </tr>
      </template>
      <template v-else-if="props.draggable">
        <tbody class="base-table__body">
          <tr>
            <td :colspan="props.columns.length" class="base-table__empty-cell">
              <slot name="empty" />
            </td>
          </tr>
        </tbody>
      </template>
      <tr v-else>
        <td :colspan="props.columns.length" class="base-table__empty-cell">
          <slot name="empty" />
        </td>
      </tr>
    </UiTable>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import { ref, watch } from "vue";
import type { ToolbarConfig } from "@/types";
import UiTable from "@/components/ui/UiTable.vue";
import ColumnResizer from "./ColumnResizer.vue";
import BaseToolbar from "./BaseToolbar.vue";
import draggable from "vuedraggable";

export interface BaseTableColumn<TRow = unknown> {
  key: keyof TRow | string;
  label: string;
  width?: number;
  minWidth?: number;
  align?: "left" | "right" | "center";
  sortable?: boolean;
}

export type SortDirection = "asc" | "desc";

export interface BaseTableCellSlotProps<TRow> {
  row: TRow;
  column: BaseTableColumn<TRow>;
  value: unknown;
  index: number;
}

interface Props {
  columns: BaseTableColumn<T>[];
  data: T[];
  rowKey?: keyof T | string;
  striped?: boolean;
  bordered?: boolean;
  sortKey?: string | null;
  sortDir?: SortDirection;
  draggable?: boolean;
  toolbar?: ToolbarConfig | null;
  search?: string;
  filters?: Record<string, string | number | undefined>;
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: "id",
  striped: false,
  bordered: true,
  sortKey: undefined,
  sortDir: "asc",
  draggable: false,
  toolbar: undefined,
  search: "",
  filters: undefined,
});

defineSlots<{
  empty?: () => unknown;
  [key: `cell-${string}`]: (props: BaseTableCellSlotProps<T>) => unknown;
}>();

const emit = defineEmits<{
  (e: "update:column-width", columnKey: string, width: number): void;
  (e: "sort", columnKey: string): void;
  (e: "reorder", fromIndex: number, toIndex: number): void;
  (e: "update:search", value: string): void;
  (e: "update:filter", key: string, value: string | number): void;
  (e: "add"): void;
}>();

const rowKeyStr = typeof props.rowKey === "string" ? props.rowKey : "id";
const internalList = ref<T[]>([]);

watch(
  () => props.data,
  (newData) => {
    internalList.value = [...newData];
  },
  { immediate: true, deep: true },
);

function onDragChange(evt: { moved?: { oldIndex: number; newIndex: number } }) {
  if (evt.moved) {
    emit("reorder", evt.moved.oldIndex, evt.moved.newIndex);
  }
}

function getRowKey(row: T): string | number {
  const value = getCellValue(row, rowKeyStr);
  return value != null ? String(value) : Math.random();
}

function getCellValue(row: T, key: string): unknown {
  return row[key];
}

function onResize(columnKey: string, width: number) {
  emit("update:column-width", columnKey, width);
}
</script>

<style scoped lang="scss">
.base-table__sort-header {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.85;
  }
}

.base-table__sort-icon {
  font-size: 0.85em;
  opacity: 0.8;
}

.base-table__body {
  &.sortable-ghost .base-table__row--ghost {
    opacity: 0.4;
  }
}

.base-table__cell--first-draggable {
  position: relative;
  padding-left: 2.25rem;
}

.base-table__row {
  &:hover .base-table__drag-handle .base-table__drag-handle-icon {
    opacity: 1;
  }

  &:hover .base-table__drag-handle {
    background-color: $color-bg-alt;
  }
}

.base-table__row--ghost {
  opacity: 0.5;
}

.base-table__drag-handle {
  position: absolute;
  left: -2rem;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  border-top-left-radius: $radius-md;
  border-bottom-left-radius: $radius-md;
  color: $color-text-muted;
  cursor: grab;
  user-select: none;
  transition:
    background-color 0.15s,
    color 0.15s;

  .base-table__drag-handle-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.875rem;
    opacity: 0;
    border-radius: $radius-sm;
    transition: opacity 0.15s;
  }

  &:active {
    cursor: grabbing;
  }
}

.base-table__cell {
  padding: $spacing-sm $spacing-md;
  color: $color-text;
  border: 1px solid $color-border;

  &--left {
    text-align: left;
  }

  &--right {
    text-align: right;
  }

  &--center {
    text-align: center;
  }
}

.base-table__empty-cell {
  padding: $spacing-xl;
  text-align: center;
  color: $color-text-muted;
  border: 1px solid $color-border;
  vertical-align: middle;
}
</style>
