<template>
  <div class="project-filters">
    <UiInput
      :model-value="searchTerm"
      placeholder="Пошук по назві..."
      class="project-filters__search"
      @update:model-value="emit('update:search', $event)"
    />
    <UiSelect
      :model-value="filters.status ?? ''"
      :options="statusOptions"
      placeholder="Усі статуси"
      class="project-filters__status"
      @update:model-value="emit('update:filter', 'status', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import UiInput from '@/components/ui/UiInput.vue'
import UiSelect from '@/components/ui/UiSelect.vue'
import type { SelectOption } from '@/components/ui/UiSelect.vue'

interface ProjectFiltersModel {
  status?: string
}

interface Props {
  searchTerm: string
  filters: ProjectFiltersModel
  statusOptions: SelectOption[]
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:filter', key: string, value: string | number): void
}>()
</script>

<style scoped lang="scss">
.project-filters {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;
}
</style>
