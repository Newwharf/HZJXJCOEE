<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TimelineSegment, TimelineEventDetail } from '@/types/oee'
import { TIMELINE_COLORS } from '@/constants/timeline'
import { timeToMinutes } from '@/utils/time'
import EventDetailPanel from './EventDetailPanel.vue'

const props = defineProps<{
  segments: TimelineSegment[]
  eventDetails: Record<string, TimelineEventDetail>
  dayStart?: string
  dayEnd?: string
}>()

const selectedId = ref<string | null>(null)

const timelineStart = computed(() => timeToMinutes(props.dayStart ?? '08:00'))
const timelineEnd = computed(() => timeToMinutes(props.dayEnd ?? '20:00'))
const totalMinutes = computed(() => timelineEnd.value - timelineStart.value)

const timeMarks = computed(() => {
  const marks: string[] = []
  for (let m = timelineStart.value; m <= timelineEnd.value; m += 120) {
    const h = Math.floor(m / 60)
    const min = m % 60
    marks.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
  }
  return marks
})

const mainSegments = computed(() =>
  props.segments.filter((s) => !s.parentId),
)

const subSegments = computed(() =>
  props.segments.filter((s) => s.parentId),
)

function getSegmentStyle(segment: TimelineSegment) {
  const start = timeToMinutes(segment.start) - timelineStart.value
  const left = (start / totalMinutes.value) * 100
  const width = (segment.duration / totalMinutes.value) * 100
  return {
    left: `${left}%`,
    width: `${width}%`,
    background: TIMELINE_COLORS[segment.type],
  }
}

function getMarkPosition(time: string) {
  const offset = timeToMinutes(time) - timelineStart.value
  return `${(offset / totalMinutes.value) * 100}%`
}

const selectedEvent = computed(() => {
  if (!selectedId.value) return null
  return props.eventDetails[selectedId.value] ?? null
})

function handleSegmentClick(segment: TimelineSegment) {
  selectedId.value = segment.id
}

const legendItems = [
  { type: 'production', label: '生产中' },
  { type: 'face_change', label: '换面中' },
  { type: 'production_change', label: '换产' },
  { type: 'fault', label: '故障' },
  { type: 'personnel_loss', label: '人员响应损失' },
  { type: 'face_change_op', label: '换面操作' },
] as const
</script>

<template>
  <div class="timeline-panel">
    <div class="timeline-panel__legend">
      <span
        v-for="item in legendItems"
        :key="item.type"
        class="timeline-panel__legend-item"
      >
        <i :style="{ background: TIMELINE_COLORS[item.type] }" />
        {{ item.label }}
      </span>
    </div>

    <div class="timeline-panel__axis">
      <span
        v-for="mark in timeMarks"
        :key="mark"
        class="timeline-panel__mark"
        :style="{ left: getMarkPosition(mark) }"
      >
        {{ mark }}
      </span>
    </div>

    <div class="timeline-panel__track">
      <div class="timeline-panel__track-label">主状态</div>
      <div class="timeline-panel__track-bar">
        <div
          v-for="seg in mainSegments"
          :key="seg.id"
          class="timeline-segment"
          :class="{ 'timeline-segment--active': selectedId === seg.id }"
          :style="getSegmentStyle(seg)"
          :title="`${seg.label} ${seg.start}-${seg.end}`"
          @click="handleSegmentClick(seg)"
        >
          <span v-if="seg.duration >= 30" class="timeline-segment__text">{{ seg.label }}</span>
        </div>
      </div>
    </div>

    <div class="timeline-panel__track timeline-panel__track--sub">
      <div class="timeline-panel__track-label">子事件</div>
      <div class="timeline-panel__track-bar">
        <div
          v-for="seg in subSegments"
          :key="seg.id"
          class="timeline-segment timeline-segment--sub"
          :class="{ 'timeline-segment--active': selectedId === seg.id }"
          :style="getSegmentStyle(seg)"
          :title="`${seg.label} ${seg.start}-${seg.end}`"
          @click="handleSegmentClick(seg)"
        >
          <span v-if="seg.duration >= 15" class="timeline-segment__text">{{ seg.label }}</span>
        </div>
      </div>
    </div>

    <EventDetailPanel :event="selectedEvent" />
  </div>
</template>

<style scoped lang="scss">
.timeline-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-panel__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 0 4px;
}

.timeline-panel__legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: rgba(232, 244, 255, 0.6);

  i {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }
}

.timeline-panel__axis {
  position: relative;
  height: 20px;
  margin-left: 52px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.15);
}

.timeline-panel__mark {
  position: absolute;
  transform: translateX(-50%);
  font-size: 11px;
  color: rgba(232, 244, 255, 0.45);
  bottom: 4px;
}

.timeline-panel__track {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timeline-panel__track-label {
  flex-shrink: 0;
  width: 44px;
  font-size: 11px;
  color: rgba(232, 244, 255, 0.45);
  text-align: right;
}

.timeline-panel__track-bar {
  position: relative;
  flex: 1;
  height: 28px;
  background: rgba(0, 20, 40, 0.6);
  border-radius: 3px;
  border: 1px solid rgba(0, 212, 255, 0.1);
}

.timeline-panel__track--sub .timeline-panel__track-bar {
  height: 22px;
}

.timeline-segment {
  position: absolute;
  top: 2px;
  height: calc(100% - 4px);
  border-radius: 2px;
  cursor: pointer;
  transition: filter 0.15s, box-shadow 0.15s;
  overflow: hidden;
  opacity: 0.85;

  &:hover {
    opacity: 1;
    filter: brightness(1.15);
    z-index: 2;
  }

  &--active {
    opacity: 1;
    box-shadow: 0 0 0 2px #fff, 0 0 12px rgba(0, 212, 255, 0.5);
    z-index: 3;
  }

  &--sub {
    top: 1px;
    height: calc(100% - 2px);
    opacity: 0.75;
  }
}

.timeline-segment__text {
  display: block;
  padding: 0 4px;
  font-size: 10px;
  color: rgba(10, 22, 40, 0.85);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 22px;
}
</style>
