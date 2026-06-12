<script setup lang="ts">
import MiniSparkline from './MiniSparkline.vue'
import MetricIcon, { type MetricIconName } from './MetricIcon.vue'

defineProps<{
  label: string
  value: string | number
  unit?: string
  icon: MetricIconName
  span?: 1 | 2
  trend?: number[]
  trendColor?: string
  dayChange?: 'up' | 'down'
  chartDelay?: number
}>()
</script>

<template>
  <div
    class="focus-metric"
    :class="{ 'focus-metric--wide': span === 2 }"
  >
    <div class="focus-metric__row">
      <div class="focus-metric__icon">
        <MetricIcon :name="icon" />
      </div>

      <div class="focus-metric__info">
        <div class="focus-metric__label">{{ label }}</div>
        <div class="focus-metric__value">
          <span class="focus-metric__number">{{ value }}</span>
          <span v-if="unit" class="focus-metric__unit">{{ unit }}</span>
          <span
            v-if="dayChange"
            class="focus-metric__arrow"
            :class="`focus-metric__arrow--${dayChange}`"
          >
            {{ dayChange === 'up' ? '↑' : '↓' }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="trend?.length" class="focus-metric__chart">
      <MiniSparkline
        :data="trend"
        :color="trendColor ?? '#00d4ff'"
        :delay="chartDelay ?? 0"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.focus-metric {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-height: 0;
  padding: 10px 12px;
  overflow: hidden;
  background: rgba(0, 40, 80, 0.35);
  border: 1px solid rgba(0, 212, 255, 0.12);
  border-radius: 4px;
  transition: border-color 0.2s;

  &:hover {
    border-color: rgba(0, 212, 255, 0.28);
  }

  &--wide {
    grid-column: span 2;
  }
}

.focus-metric__row {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.focus-metric__icon {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(0, 102, 255, 0.18);
  color: #00d4ff;

  :deep(.metric-icon) {
    width: 22px;
    height: 22px;
  }
}

.focus-metric--wide .focus-metric__icon {
  width: 46px;
  height: 46px;

  :deep(.metric-icon) {
    width: 24px;
    height: 24px;
  }
}

.focus-metric__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.focus-metric__label {
  font-size: 12px;
  line-height: 1.3;
  color: rgba(232, 244, 255, 0.65);
}

.focus-metric--wide .focus-metric__label {
  font-size: 13px;
}

.focus-metric__value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.focus-metric__number {
  font-size: 26px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  background: linear-gradient(90deg, #00d4ff, #00ffcc);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.focus-metric--wide .focus-metric__number {
  font-size: 30px;
}

.focus-metric__unit {
  font-size: 12px;
  color: rgba(232, 244, 255, 0.45);
}

.focus-metric__arrow {
  margin-left: 4px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;

  &--up {
    color: #00e5a0;
  }

  &--down {
    color: #ff6b9d;
  }
}

.focus-metric--wide .focus-metric__arrow {
  font-size: 20px;
}

.focus-metric__chart {
  flex: 1;
  min-height: 0;
  max-height: 32px;
  margin-top: auto;
  overflow: hidden;
}
</style>
