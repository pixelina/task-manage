<template>
  <div class="app-container" :style="{ maxWidth }">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  maxWidth?: string
}

withDefaults(defineProps<Props>(), {
  maxWidth: '1200px',
})
</script>

<style scoped lang="scss">
.app-container {
  width: 100%;
  margin: 0 auto;
  padding: 0 $spacing-lg;
}
</style>
