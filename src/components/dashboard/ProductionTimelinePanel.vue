<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { TimelineSegment, TimelineEventDetail } from '@/types/oee'
import EventVideoModal from '@/components/dashboard/EventVideoModal.vue'
import {
  getBlockIdByChildId,
  getCategoryBlocks,
  getCategorySegmentColor,
  getDetailItems,
  getFirstChildId,
  getSegmentStyle,
  getSubTypeColor,
  getSubTypeLabel,
  type TimelineDetailItem,
} from '@/utils/productionTimeline'
import { getHeatmapTimeMarks } from '@/utils/heatmap'
import { timeToMinutes, formatDuration } from '@/utils/time'
import { V2_TIMELINE_COLORS } from '@/constants/dashboardV2ChartTheme'
import type { TimelineCategory } from '@/utils/productionTimeline'
import type { TimelineEventType } from '@/types/oee'

const props = defineProps<{
  segments: TimelineSegment[]
  eventDetails: Record<string, TimelineEventDetail>
  dayStart?: string
  dayEnd?: string
  variant?: 'default' | 'muted'
}>()

const isMuted = computed(() => props.variant === 'muted')

function categoryColor(category: TimelineCategory) {
  if (isMuted.value) {
    return category === 'running'
      ? V2_TIMELINE_COLORS.production
      : V2_TIMELINE_COLORS.unknown_downtime
  }
  return getCategorySegmentColor(category)
}

function subTypeColor(type: TimelineEventType) {
  if (isMuted.value) return V2_TIMELINE_COLORS[type]
  return getSubTypeColor(type)
}

const selectedId = ref<string | null>(null)
const detailListRef = ref<HTMLElement | null>(null)
const videoModalVisible = ref(false)
const videoEvent = ref<TimelineDetailItem | null>(null)

const dayStart = computed(() => props.dayStart ?? '08:00')
const dayEnd = computed(() => props.dayEnd ?? '20:00')

const blocks = computed(() =>
  getCategoryBlocks(props.segments, props.eventDetails),
)

const detailItems = computed(() => getDetailItems(blocks.value))

const timeMarks = computed(() =>
  getHeatmapTimeMarks(dayStart.value, dayEnd.value, 60),
)

const totalMinutes = computed(() =>
  timeToMinutes(dayEnd.value) - timeToMinutes(dayStart.value),
)

const activeBlockId = computed(() => {
  if (!selectedId.value) return null
  return getBlockIdByChildId(blocks.value, selectedId.value)
})

function getMarkTop(time: string) {
  const offset = timeToMinutes(time) - timeToMinutes(dayStart.value)
  return `${(offset / totalMinutes.value) * 100}%`
}

function getSegmentAnimDelay(start: string) {
  const offset = timeToMinutes(start) - timeToMinutes(dayStart.value)
  return `${Math.max(0, offset * 3)}ms`
}

function getMarkAnimDelay(index: number) {
  return `${index * 35}ms`
}

function getDetailAnimDelay(index: number) {
  return `${80 + index * 30}ms`
}

function scrollToDetail(id: string) {
  nextTick(() => {
    const el = detailListRef.value?.querySelector(`[data-event-id="${id}"]`)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })
}

function selectCategory(blockId: string) {
  const firstChildId = getFirstChildId(blocks.value, blockId)
  if (!firstChildId) return
  selectedId.value = firstChildId
  scrollToDetail(firstChildId)
}

function selectSubEvent(id: string) {
  selectedId.value = id
  scrollToDetail(id)
}

function openVideo(item: TimelineDetailItem) {
  videoEvent.value = item
  videoModalVisible.value = true
}
</script>

<template>
  <div class="production-timeline" :class="{ 'production-timeline--muted': isMuted }">
    <div class="production-timeline__track-area">
      <div class="production-timeline__axis">
        <span
          v-for="(mark, markIndex) in timeMarks"
          :key="mark"
          class="production-timeline__mark"
          :style="{
            top: getMarkTop(mark),
            animationDelay: getMarkAnimDelay(markIndex),
          }"
        >
          {{ mark }}
        </span>
      </div>

      <div class="production-timeline__tracks">
        <div class="production-timeline__track-col production-timeline__track-col--category">
          <div class="production-timeline__track">
            <div
              v-for="block in blocks"
              :key="block.id"
              class="production-timeline__segment"
              :class="{
                'production-timeline__segment--active': activeBlockId === block.id,
              }"
              :style="{
                ...getSegmentStyle(block, dayStart, dayEnd),
                background: categoryColor(block.category),
                animationDelay: getSegmentAnimDelay(block.start),
              }"
              :title="`${block.categoryLabel} ${block.start}-${block.end}`"
              @click="selectCategory(block.id)"
            />
          </div>
        </div>

        <div class="production-timeline__track-col production-timeline__track-col--subtype">
          <div class="production-timeline__track">
            <template v-for="block in blocks" :key="block.id">
              <template v-if="block.category === 'downtime'">
                <div
                  v-for="child in block.children"
                  :key="child.id"
                  class="production-timeline__segment"
                  :class="{
                    'production-timeline__segment--active': selectedId === child.id,
                    'production-timeline__segment--dimmed':
                      activeBlockId === block.id && selectedId !== child.id,
                  }"
                  :style="{
                    ...getSegmentStyle(child, dayStart, dayEnd),
                    background: subTypeColor(child.segmentType),
                    animationDelay: getSegmentAnimDelay(child.start),
                  }"
                  :title="`${getSubTypeLabel(child.segmentType)} ${child.start}-${child.end}`"
                  @click="selectSubEvent(child.id)"
                />
              </template>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div ref="detailListRef" class="production-timeline__details">
      <div
        v-for="(item, detailIndex) in detailItems"
        :key="item.id"
        :data-event-id="item.id"
        class="production-timeline__detail-item"
        :class="{
          'production-timeline__detail-item--active': selectedId === item.id,
        }"
        :style="{ animationDelay: getDetailAnimDelay(detailIndex) }"
        @click="selectSubEvent(item.id)"
      >
        <div class="production-timeline__detail-body">
          <div class="production-timeline__detail-header">
            <span
              class="production-timeline__badge"
              :style="{ background: subTypeColor(item.subType) }"
            >
              {{ item.subTypeLabel }}
            </span>
          </div>
          <div class="production-timeline__detail-title">{{ item.label }}</div>
          <div class="production-timeline__detail-meta">
            <span>持续 {{ formatDuration(item.duration) }}</span>
            <span class="production-timeline__detail-time">
              {{ item.start }} — {{ item.end }}
            </span>
          </div>
          <div
            v-if="item.detail?.description && item.subType !== 'production'"
            class="production-timeline__detail-desc"
          >
            {{ item.detail.description }}
          </div>
        </div>
        <button
          type="button"
          class="production-timeline__play-btn"
          aria-label="播放视频"
          @click.stop="openVideo(item)"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 3.5v9l7.5-4.5L4 3.5z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>

    <EventVideoModal
      v-model:visible="videoModalVisible"
      :event="videoEvent"
    />
  </div>
</template>

<style scoped lang="scss">
.production-timeline {
  display: flex;
  gap: 10px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.production-timeline__track-area {
  flex: 0 0 68px;
  width: 68px;
  min-height: 0;
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.production-timeline__axis {
  position: relative;
  flex: 0 0 26px;
  border-right: 1px solid rgba(0, 212, 255, 0.12);
}

.production-timeline__mark {
  position: absolute;
  right: 3px;
  transform: translateY(-50%);
  font-size: 8px;
  color: rgba(232, 244, 255, 0.4);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  animation: timeline-mark-enter 0.28s ease both;
}

.production-timeline__tracks {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  gap: 2px;
}

.production-timeline__track-col {
  min-height: 0;
  display: flex;
  flex-direction: column;

  &--category,
  &--subtype {
    flex: 0 0 12px;
    width: 12px;
  }
}

.production-timeline__track-col--subtype .production-timeline__track {
  background: transparent;
  border-color: transparent;
}

.production-timeline__track {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: rgba(0, 20, 40, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.1);
  border-radius: 0;
}

.production-timeline__segment {
  position: absolute;
  left: 0;
  right: 0;
  border-radius: 0;
  cursor: pointer;
  opacity: 1;
  transform-origin: top center;
  animation: timeline-segment-enter 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: opacity 0.15s, box-shadow 0.15s, filter 0.15s;

  &:hover {
    opacity: 1;
    filter: brightness(1.1);
    z-index: 2;
  }

  &--dimmed {
    opacity: 0.65;
  }

  &--active {
    opacity: 1;
    filter: none;
    box-shadow: 0 0 0 1px #fff, 0 0 8px rgba(0, 212, 255, 0.4);
    z-index: 3;
  }
}

.production-timeline__details {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.25);
    border-radius: 2px;
  }
}

.production-timeline__detail-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(0, 40, 80, 0.35);
  border: 1px solid rgba(0, 212, 255, 0.1);
  border-radius: 0;
  cursor: pointer;
  animation: timeline-detail-enter 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: rgba(0, 212, 255, 0.28);
    background: rgba(0, 50, 90, 0.4);
  }

  &--active {
    border-color: rgba(0, 212, 255, 0.5);
    background: rgba(0, 60, 110, 0.45);
    box-shadow: inset 0 0 12px rgba(0, 102, 255, 0.12);
  }

}

.production-timeline__detail-body {
  flex: 1;
  min-width: 0;
}

.production-timeline__detail-header {
  margin-bottom: 4px;
}

.production-timeline__badge {
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 0;
  font-size: 10px;
  font-weight: 600;
  color: #0a1628;
}

.production-timeline__detail-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  color: rgba(232, 244, 255, 0.5);
}

.production-timeline__detail-time {
  font-size: 10px;
  color: rgba(232, 244, 255, 0.45);
  font-variant-numeric: tabular-nums;
}

.production-timeline__detail-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(232, 244, 255, 0.9);
  margin-bottom: 2px;
}

.production-timeline__detail-desc {
  margin-top: 4px;
  font-size: 10px;
  line-height: 1.45;
  color: rgba(232, 244, 255, 0.55);
}

.production-timeline__play-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid rgba(0, 212, 255, 0.22);
  border-radius: 50%;
  background: rgba(0, 50, 90, 0.35);
  color: rgba(232, 244, 255, 0.8);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;

  svg {
    width: 12px;
    height: 12px;
    margin-left: 1px;
  }

  &:hover {
    border-color: rgba(0, 212, 255, 0.45);
    background: rgba(0, 70, 120, 0.45);
    color: #fff;
  }
}

@keyframes timeline-segment-enter {
  from {
    opacity: 0;
    transform: scaleY(0);
  }

  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

@keyframes timeline-mark-enter {
  from {
    opacity: 0;
    transform: translateY(calc(-50% + 6px));
  }

  to {
    opacity: 1;
    transform: translateY(-50%);
  }
}

@keyframes timeline-detail-enter {
  from {
    opacity: 0;
    transform: translateX(14px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.production-timeline--muted {
  .production-timeline__track-col--category,
  .production-timeline__track-col--subtype {
    flex: 0 0 14px;
    width: 14px;
  }

  .production-timeline__track {
    background: #141a22;
    border-color: #252f3d;
  }

  .production-timeline__track-col--subtype .production-timeline__track {
    background: transparent;
    border-color: transparent;
  }

  .production-timeline__segment {
    opacity: 1;

    &--active {
      box-shadow: 0 0 0 1px #64748b, 0 0 6px rgba(100, 116, 139, 0.25);
    }
  }

  .production-timeline__mark {
    color: #64748b;
  }

  .production-timeline__detail-item {
    background: #141a22;
    border-color: #252f3d;

    &:hover {
      border-color: #3d4a58;
      background: #181f28;
    }

    &--active {
      border-color: #475569;
      background: #1a222d;
      box-shadow: none;
    }
  }

  .production-timeline__detail-meta,
  .production-timeline__detail-time,
  .production-timeline__detail-desc {
    color: #64748b;
  }

  .production-timeline__detail-title {
    color: #cbd5e1;
  }

  .production-timeline__play-btn {
    border-color: #3d4a58;
    background: #181f28;
    color: #94a3b8;

    &:hover {
      border-color: #475569;
      background: #1e2633;
      color: #cbd5e1;
    }
  }
}
</style>
