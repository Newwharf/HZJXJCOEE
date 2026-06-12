<script setup lang="ts">
import { computed } from 'vue'
import GlassPanel from './GlassPanel.vue'
import DowntimeChart from '@/components/dashboard/DowntimeChart.vue'
import type { DowntimeItem } from '@/types/oee'

const props = defineProps<{
  rate: number
  downtimeData: DowntimeItem[]
}>()

const RING_CIRCUMFERENCE = 125.7
const displayDash = computed(() => props.rate * 1.257)
const displayRate = computed(() => Math.round(props.rate))
</script>

<template>
  <GlassPanel title="设备可用率" class="availability-card">
    <div class="availability">
      <div class="availability__hero">
        <div
          class="availability__ring"
          role="img"
          :aria-label="`可用率 ${displayRate}%`"
        >
          <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <circle
              class="availability__ring-track"
              cx="24"
              cy="24"
              r="20"
              stroke-width="3"
            />
            <circle
              class="availability__ring-scan"
              cx="24"
              cy="24"
              r="20"
              stroke-width="1.5"
            />
            <circle
              class="availability__ring-progress"
              cx="24"
              cy="24"
              r="20"
              stroke-width="3"
              stroke-linecap="round"
              :stroke-dasharray="`${displayDash} ${RING_CIRCUMFERENCE}`"
              transform="rotate(-90 24 24)"
            />
          </svg>
          <span class="availability__rate">{{ displayRate }}%</span>
        </div>
        <div class="availability__meta">
          <span class="availability__label">今日可用率</span>
          <span class="availability__hint">设备正常运行时间占比</span>
        </div>
      </div>

      <div class="availability__divider" />

      <div class="availability__chart-section">
        <h3 class="availability__chart-title">计划外停机时长分析</h3>
        <div class="availability__chart">
          <DowntimeChart variant="muted" :data="downtimeData" />
        </div>
      </div>
    </div>
  </GlassPanel>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v2/variables' as *;

.availability-card {
  min-height: 0;

  :deep(.panel__body) {
    display: flex;
    flex-direction: column;
  }
}

.availability {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.availability__hero {
  display: flex;
  align-items: center;
  gap: $v2-space-xl;
  flex-shrink: 0;
}

.availability__ring {
  position: relative;
  flex-shrink: 0;
  width: 72px;
  height: 72px;

  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
}

.availability__ring-track {
  stroke: $v2-border;
  fill: none;
}

.availability__ring-scan {
  stroke: #5a9a78;
  fill: none;
  stroke-dasharray: 4 10;
  opacity: 0.28;
  transform-origin: 24px 24px;
  animation: availability-ring-scan 12s linear infinite;
}

.availability__ring-progress {
  stroke: #5a9a78;
  fill: none;
  animation: availability-ring-breathe 2.6s ease-in-out infinite;
}

.availability__rate {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: $v2-text;
  line-height: 1;
  letter-spacing: -0.02em;
  animation: availability-rate-breathe 2.6s ease-in-out infinite;
}

@keyframes availability-ring-scan {
  from {
    transform: rotate(-90deg);
  }

  to {
    transform: rotate(270deg);
  }
}

@keyframes availability-ring-breathe {
  0%, 100% {
    opacity: 0.72;
    stroke: #4d8f6a;
  }

  50% {
    opacity: 1;
    stroke: #6db892;
  }
}

@keyframes availability-rate-breathe {
  0%, 100% {
    opacity: 0.88;
  }

  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .availability__ring-scan,
  .availability__ring-progress,
  .availability__rate {
    animation: none;
  }

  .availability__ring-progress {
    opacity: 1;
    stroke: #5a9a78;
  }
}

.availability__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.availability__label {
  font-size: 15px;
  font-weight: 600;
  color: $v2-text;
  line-height: 1.3;
}

.availability__hint {
  font-size: 11px;
  color: $v2-text-muted;
  line-height: 1.4;
}

.availability__divider {
  height: 1px;
  margin: $v2-space-md 0;
  background: $v2-border-subtle;
  flex-shrink: 0;
}

.availability__chart-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.availability__chart-title {
  flex-shrink: 0;
  margin-bottom: $v2-space-xs;
  font-size: 12px;
  font-weight: 500;
  color: $v2-text-muted;
}

.availability__chart {
  flex-shrink: 0;
  width: 100%;
  height: 220px;
  min-height: 220px;
  overflow: hidden;

  :deep(.downtime-chart) {
    height: 100%;
    min-height: 220px;
  }
}
</style>
