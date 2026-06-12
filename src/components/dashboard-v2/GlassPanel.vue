<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <section class="panel">
    <header v-if="title" class="panel__header">
      <div class="panel__title-group">
        <h2 class="panel__title">{{ title }}</h2>
        <p v-if="subtitle" class="panel__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="panel__actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="panel__body" :class="{ 'panel__body--no-header': !title }">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v2/variables' as *;

.panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: $v2-bg-surface;
  border: 1px solid $v2-border-subtle;
  border-radius: $v2-radius-md;
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $v2-space-md;
  padding: $v2-space-sm $v2-space-lg;
  border-bottom: 1px solid $v2-border-subtle;
}

.panel__title {
  font-size: 13px;
  font-weight: 500;
  color: $v2-text-secondary;
  letter-spacing: 0.01em;
}

.panel__subtitle {
  margin-top: 1px;
  font-size: 11px;
  color: $v2-text-muted;
}

.panel__body {
  flex: 1;
  min-height: 0;
  padding: $v2-space-lg;

  &--no-header {
    padding: $v2-space-lg;
  }
}
</style>
