<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  showInfo?: boolean
  headerBorder?: boolean
}>()
</script>

<template>
  <section class="v3-panel">
    <header
      v-if="title"
      class="v3-panel__header"
      :class="{ 'v3-panel__header--plain': headerBorder === false }"
    >
      <div class="v3-panel__title-group">
        <h2 class="v3-panel__title">{{ title }}</h2>
        <span v-if="showInfo !== false" class="v3-panel__info" aria-hidden="true">i</span>
      </div>
      <p v-if="subtitle" class="v3-panel__subtitle">{{ subtitle }}</p>
      <div v-if="$slots.actions" class="v3-panel__actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="v3-panel__body" :class="{ 'v3-panel__body--no-header': !title }">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="v3-panel__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v3/variables' as *;

.v3-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: $v3-bg-card;
  border: none;
  border-radius: $v3-radius-md;
  overflow: hidden;
}

.v3-panel__header {
  display: flex;
  align-items: center;
  gap: $v3-space-sm;
  flex-shrink: 0;
  padding: 10px $v3-space-lg;
  border-bottom: none;

  &--plain {
    border-bottom: none;
  }
}

.v3-panel__title-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.v3-panel__title {
  font-size: 18px;
  font-weight: 500;
  color: $v3-text;
  letter-spacing: 0.01em;
}

.v3-panel__info {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border: 1px solid $v3-text-muted;
  border-radius: 50%;
  font-size: 9px;
  font-style: italic;
  font-weight: 600;
  color: $v3-text-muted;
  line-height: 1;
}

.v3-panel__subtitle {
  font-size: 11px;
  color: $v3-text-muted;
}

.v3-panel__actions {
  margin-left: auto;
}

.v3-panel__body {
  flex: 1;
  min-height: 0;
  padding: $v3-space-md $v3-space-lg;

  &--no-header {
    padding: $v3-space-lg;
  }
}

.v3-panel__footer {
  flex-shrink: 0;
  padding: $v3-space-sm $v3-space-lg;
  border-top: none;
}
</style>
