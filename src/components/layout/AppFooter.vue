<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <a
        href="https://t.me/p_mysiura"
        target="_blank"
        rel="noopener noreferrer"
        class="app-footer__link"
      >
        Powered by @p_mysiura
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.app-footer {
  border-top: 1px solid $color-border;
  background-color: $color-bg-alt;
  font-size: $font-size-sm;
  color: $color-text-muted;

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: $spacing-md $spacing-lg;
    text-align: center;
  }

  &__link {
    color: inherit;
    transition: color 0.15s;

    &:hover {
      color: $color-primary;
    }
  }
}
</style>
