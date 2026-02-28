<template>
  <div class="base-toolbar">
    <template v-if="props.toolbar">
      <template v-if="showSearch">
        <UiInput
          :model-value="props.search"
          :placeholder="searchPlaceholder"
          class="base-toolbar__search"
          @update:model-value="emit('update:search', $event)"
        />
      </template>
      <template v-for="f in props.toolbar.filters" :key="f.key">
        <UiSelect
          :model-value="String(props.filters?.[f.key] ?? '')"
          :options="f.options"
          :placeholder="f.placeholder ?? ''"
          class="base-toolbar__filter"
          @update:model-value="emit('update:filter', f.key, $event)"
        />
      </template>
      <UiButton class="base-toolbar__actions" @click="emit('add')">
        {{ props.toolbar.addLabel }}
      </UiButton>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ToolbarConfig } from "@/types";
import UiInput from "@/components/ui/UiInput.vue";
import UiSelect from "@/components/ui/UiSelect.vue";
import UiButton from "@/components/ui/UiButton.vue";

interface Props {
  toolbar?: ToolbarConfig | null;
  search?: string;
  filters?: Record<string, string | number | undefined>;
}

const props = withDefaults(defineProps<Props>(), {
  toolbar: undefined,
  search: "",
  filters: () => ({}),
});

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "update:filter", key: string, value: string | number): void;
  (e: "add"): void;
}>();

const showSearch = computed(() => {
  const s = props.toolbar?.search;
  return s !== false && s !== undefined;
});

const searchPlaceholder = computed(() => {
  const s = props.toolbar?.search;
  return (s && typeof s === "object" ? s.placeholder : undefined) ?? "";
});
</script>

<style scoped lang="scss">
.base-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.base-toolbar__actions {
  margin-left: auto;
}
</style>
