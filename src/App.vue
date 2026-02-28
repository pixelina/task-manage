<template>
  <div class="app">
    <AppHeader />
    <main class="app__main">
      <AppContainer>
        <router-view />
      </AppContainer>
    </main>
    <AppFooter />
    <UiToast
      :model-value="toast.visible.value"
      :message="toast.message.value"
      :type="toast.type.value"
      :duration="toast.duration.value"
      @update:model-value="toast.close()"
    />
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppContainer from '@/components/layout/AppContainer.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import UiToast from '@/components/ui/UiToast.vue'

const toast = useToast()
</script>

<style scoped lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &__main {
    flex: 1;
    padding: $spacing-lg 0;
  }
}
</style>
