<template>
  <div class="ui-table-wrapper">
    <table class="ui-table" :class="{ 'ui-table--striped': props.striped, 'ui-table--bordered': props.bordered }">
      <thead class="ui-table__head">
        <slot name="header" />
      </thead>
      <tbody v-if="!props.noBodyWrap" class="ui-table__body">
        <slot />
      </tbody>
      <slot v-else />
    </table>
  </div>
</template>

<script setup lang="ts">
interface Props {
  striped?: boolean
  bordered?: boolean
  /** When true, default slot is rendered as-is (e.g. for draggable tbody). */
  noBodyWrap?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  striped: false,
  bordered: true,
  noBodyWrap: false,
})
</script>

<style scoped lang="scss">
.ui-table-wrapper {
  border-radius: $radius-md;
  overflow: visible;
  outline: 1px solid $color-border;
}

.ui-table {
  width: 100%;
  font-size: $font-size-base;

  &--bordered {
    border-collapse: separate;
    border-spacing: 0;

    :deep(th),
    :deep(td) {
      border-right: 1px solid $color-border;
      border-bottom: 1px solid $color-border;

      &:first-child {
        border-left: 1px solid $color-border;
      }
    }

    :deep(thead th) {
      border-top: 1px solid $color-border;
    }

    /* Rounded corners: :deep() so slot content (BaseTable's thead/tbody cells) is styled. */
    :deep(thead tr:first-child th:first-child) {
      border-top-left-radius: $radius-md;
    }

    :deep(thead tr:first-child th:last-child) {
      border-top-right-radius: $radius-md;
    }

    :deep(tbody tr:last-child td:last-child) {
      border-bottom-right-radius: $radius-md;
    }

    :deep(tbody tr:last-child td:first-child) {
      border-bottom-left-radius: $radius-md;
    }

    /* Remove bottom-left rounding when last row is hovered. */
    :deep(tbody tr:last-child:hover td:first-child) {
      border-bottom-left-radius: 0;
    }
  }

  &:not(&--bordered) {
    border-collapse: collapse;
  }

  &--striped tbody tr:nth-child(even) {
    background-color: $color-bg-alt;
  }

  &__head {
    background-color: $color-bg-alt;
  }

  &__head th {
    padding: $spacing-sm $spacing-md;
    font-weight: 600;
    text-align: left;
    color: $color-text;
  }

  &__body td {
    padding: $spacing-sm $spacing-md;
    color: $color-text;
  }

  &__body tr:hover {
    background-color: rgba($color-primary, 0.06);
  }
}
</style>
