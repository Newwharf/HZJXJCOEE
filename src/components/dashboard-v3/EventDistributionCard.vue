<script setup lang="ts">
import V3Panel from './V3Panel.vue'
import TimelineHeatmap from '@/components/dashboard/TimelineHeatmap.vue'
import { HEATMAP_LABELS } from '@/constants/heatmap'
import { V3_HEATMAP_COLORS } from '@/constants/dashboardV3ChartTheme'
import type { EventDistributionStat, TimelineEventDetail, TimelineSegment } from '@/types/oee'

defineProps<{
  segments: TimelineSegment[]
  eventDetails: Record<string, TimelineEventDetail>
  stats?: EventDistributionStat[]
}>()

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatPercent(value?: number) {
  if (value == null) return '—'
  return `${value.toFixed(1)}%`
}

function formatCompareDuration(minutes?: number) {
  if (minutes == null) return '—'
  return formatDuration(minutes)
}
</script>

<template>
  <V3Panel title="今日事件分布" class="event-distribution">
    <TimelineHeatmap
      variant="v3"
      :segments="segments"
      :event-details="eventDetails"
      day-start="00:00"
      day-end="24:00"
      :grid-cols="24"
      :grid-rows="6"
      :show-legend="false"
      :time-mark-interval="240"
      auto-height
      size-by-width
      :min-cell-size="3"
      :max-cell-size="10"
      class="event-distribution__heatmap"
    />

    <p class="event-distribution__hint">每个方格代表 10 分钟</p>

    <div v-if="stats?.length" class="event-distribution__table">
      <div
        v-for="item in stats"
        :key="item.type"
        class="event-distribution__row"
      >
        <div class="event-distribution__label">
          <i :style="{ background: V3_HEATMAP_COLORS[item.type] }" />
          <span>{{ HEATMAP_LABELS[item.type] }}</span>
        </div>
        <span class="event-distribution__cell">{{ formatDuration(item.durationMinutes) }}</span>
        <span
          class="event-distribution__cell event-distribution__cell--accent"
          :style="{ color: V3_HEATMAP_COLORS[item.type] }"
        >
          {{ formatPercent(item.percent) }}
        </span>
        <span class="event-distribution__cell">{{ formatCompareDuration(item.compareDurationMinutes) }}</span>
        <span class="event-distribution__cell">{{ formatPercent(item.comparePercent) }}</span>
      </div>
    </div>
  </V3Panel>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v3/variables' as *;

.event-distribution {
  min-height: 0;
  overflow: visible;

  :deep(.v3-panel__body) {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 6px;
    padding: $v3-space-sm $v3-space-md $v3-space-sm;
    overflow: visible;
  }
}

.event-distribution__heatmap {
  flex: 0 0 auto;
  width: 100%;
}

.event-distribution__hint {
  flex: 0 0 auto;
  margin: 0;
  font-size: 10px;
  line-height: 1.2;
  color: $v3-text-muted;
}

.event-distribution__table {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.event-distribution__row {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) repeat(4, minmax(0, 1fr));
  align-items: center;
  min-height: 22px;
}

.event-distribution__label {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 11px;
  color: $v3-text-secondary;

  i {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.event-distribution__cell {
  padding: 0 8px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: $v3-text;
  text-align: center;
  border-left: 1px solid $v3-divider;

  &--accent {
    font-weight: 500;
  }
}
</style>
