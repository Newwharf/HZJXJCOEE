<script setup lang="ts">
import MiniSparkline from '@/components/dashboard/MiniSparkline.vue'
import type { MetricDayChange } from '@/types/oee'

defineProps<{
  label: string
  value: string | number
  unitLabel: string
  trend?: number[]
  trendColor?: string
  changePercent?: number
  dayChange?: MetricDayChange
}>()
</script>

<template>
  <article class="mini-metric">
    <span class="mini-metric__label">{{ label }} ({{ unitLabel }})</span>
    <div class="mini-metric__value-row">
      <span class="mini-metric__value">{{ value }}</span>
      <span
        v-if="changePercent != null && dayChange"
        class="mini-metric__change"
        :class="`mini-metric__change--${dayChange}`"
      >
        <span class="mini-metric__arrow" aria-hidden="true">{{ dayChange === 'up' ? '↑' : '↓' }}</span>
        {{ changePercent.toFixed(1) }}%
      </span>
    </div>
    <div v-if="trend?.length" class="mini-metric__chart">
      <MiniSparkline :data="trend" :color="trendColor ?? '#a6e22e'" :delay="0" fixed-stroke />
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v3/variables' as *;

.mini-metric {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
  min-height: 0;
  padding: 10px 12px 8px;
  background: $v3-bg-card;
  border: none;
  border-radius: $v3-radius-md;
  overflow: hidden;
}

.mini-metric__label {
  font-size: 14px;
  line-height: 1.35;
  color: $v3-text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-metric__value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.mini-metric__value {
  font-size: 22px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: $v3-text;
  letter-spacing: -0.02em;
}

.mini-metric__change {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  line-height: 1;

  &--down {
    color: $v3-neon-green;
  }

  &--up {
    color: $v3-danger;
  }
}

.mini-metric__arrow {
  font-size: 11px;
  line-height: 1;
}

.mini-metric__chart {
  flex: 1;
  min-height: 36px;
  margin-top: auto;

  :deep(.mini-sparkline) {
    max-height: none;
    height: 100%;
  }
}
</style>
