<script setup lang="ts">
import MiniSparkline from '@/components/dashboard/MiniSparkline.vue'
import MetricIcon, { type MetricIconName } from '@/components/dashboard/MetricIcon.vue'

defineProps<{
  label: string
  value: string | number
  unit?: string
  icon: MetricIconName
  trend?: number[]
  trendColor?: string
  dayChange?: 'up' | 'down'
  chartDelay?: number
}>()
</script>

<template>
  <article class="metric-row">
    <div class="metric-row__icon" aria-hidden="true">
      <MetricIcon :name="icon" />
    </div>

    <div class="metric-row__content">
      <span class="metric-row__label">{{ label }}</span>
      <div class="metric-row__value-line">
        <span class="metric-row__value">{{ value }}</span>
        <span v-if="unit" class="metric-row__unit">{{ unit }}</span>
        <span
          v-if="dayChange"
          class="metric-row__delta"
          :class="`metric-row__delta--${dayChange}`"
          :aria-label="dayChange === 'up' ? '较昨日上升' : '较昨日下降'"
        >
          {{ dayChange === 'up' ? '↑' : '↓' }}
        </span>
      </div>
    </div>

    <div v-if="trend?.length" class="metric-row__sparkline">
      <MiniSparkline
        :data="trend"
        :color="trendColor ?? '#5c6b7e'"
        :delay="0"
      />
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v2/variables' as *;

.metric-row {
  display: grid;
  grid-template-columns: 20px 1fr 140px;
  align-items: center;
  gap: $v2-space-md;
  height: 100%;
  min-height: 0;
  padding: $v2-space-sm $v2-space-lg;
  border-bottom: 1px solid $v2-border-subtle;

  &:last-child {
    border-bottom: none;
  }
}

.metric-row__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: $v2-text-muted;

  :deep(.metric-icon) {
    width: 16px;
    height: 16px;
  }
}

.metric-row__content {
  min-width: 0;
}

.metric-row__label {
  display: block;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  color: $v2-text-muted;
}

.metric-row__value-line {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 1px;
}

.metric-row__value {
  font-size: 20px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  color: $v2-text;
}

.metric-row__unit {
  font-size: 11px;
  color: $v2-text-muted;
}

.metric-row__delta {
  margin-left: 2px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;

  &--up { color: $v2-accent; }
  &--down { color: $v2-danger; }
}

.metric-row__sparkline {
  height: 24px;
  min-width: 0;
  opacity: 0.7;
}
</style>
