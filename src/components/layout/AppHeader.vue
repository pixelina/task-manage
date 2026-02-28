<template>
  <header class="app-header">
    <div class="app-header__inner">
      <RouterLink :to="{ name: 'home' }" class="app-header__title">
        {{ title }}
      </RouterLink>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Task Manage',
})
</script>

<style scoped lang="scss">
.app-header {
  background-color: $color-bg;
  border-bottom: 1px solid $color-border;

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-md;
    max-width: 1200px;
    margin: 0 auto;
    padding: $spacing-md $spacing-lg;
  }

  &__title {
    margin: 0;
    font-size: $font-size-xl;
    font-weight: 600;
    color: $color-text;
    text-decoration: none;
    transition: color 0.15s;

    &:hover {
      color: $color-primary;
    }
  }
}
</style>
