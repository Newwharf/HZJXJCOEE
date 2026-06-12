<script setup lang="ts">
defineProps<{
  selectedDate: string
  minDate: string
  maxDate: string
}>()

const emit = defineEmits<{
  'update:selectedDate': [value: string]
}>()

function onDateChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (value) emit('update:selectedDate', value)
}
</script>

<template>
  <header class="v2-header">
    <div class="v2-header__brand">
      <span class="v2-header__brand-name">杭州机械局 · OEE 监控</span>
      <span class="v2-header__brand-sub">机床加工厂统计平台</span>
    </div>

    <h1 class="v2-header__title">OEE 统计大屏</h1>

    <div class="v2-header__actions">
      <label class="v2-header__date">
        <input
          type="date"
          :value="selectedDate"
          :min="minDate"
          :max="maxDate"
          aria-label="选择日期"
          @change="onDateChange"
        />
      </label>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v2/variables' as *;

.v2-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $v2-space-xl;
  margin: $v2-space-md 0 $v2-space-lg;
  padding-bottom: $v2-space-md;
  border-bottom: 1px solid $v2-border-subtle;
  z-index: $v2-z-header;
}

.v2-header__brand {
  min-width: 200px;
}

.v2-header__brand-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: $v2-text-secondary;
}

.v2-header__brand-sub {
  display: block;
  font-size: 11px;
  color: $v2-text-muted;
}

.v2-header__title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: $v2-text;
}

.v2-header__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 200px;
}

.v2-header__date {
  padding: 5px 10px;
  background: transparent;
  border: 1px solid $v2-border;
  border-radius: $v2-radius-sm;
  cursor: pointer;
  transition: border-color $v2-transition;

  input {
    background: transparent;
    border: none;
    font-family: inherit;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    color: $v2-text;
    cursor: pointer;

    &::-webkit-calendar-picker-indicator {
      cursor: pointer;
      filter: invert(0.65);
    }
  }

  &:hover {
    border-color: $v2-border-hover;
  }

  &:focus-within {
    outline: 1px solid $v2-border-hover;
    outline-offset: 1px;
  }
}
</style>
