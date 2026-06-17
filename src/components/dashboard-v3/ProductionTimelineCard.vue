<script setup lang="ts">
import V3Panel from './V3Panel.vue'
import ProductionTimelinePanel from '@/components/dashboard/ProductionTimelinePanel.vue'
import type { TimelineEventDetail, TimelineSegment } from '@/types/oee'

defineProps<{
  segments: TimelineSegment[]
  eventDetails: Record<string, TimelineEventDetail>
}>()
</script>

<template>
  <V3Panel title="今日生产时间轴" class="production-timeline-card">
    <ProductionTimelinePanel
      variant="v3"
      :segments="segments"
      :event-details="eventDetails"
      day-start="00:00"
      day-end="24:00"
      :time-mark-interval="240"
    />
  </V3Panel>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v3/variables' as *;

.production-timeline-card {
  min-height: 0;

  :deep(.v3-panel__body) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    padding: $v3-space-sm $v3-space-md $v3-space-md;
  }
}
</style>
