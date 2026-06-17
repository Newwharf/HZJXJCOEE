<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { TimelineSegment, TimelineEventDetail } from '@/types/oee'
import EventVideoModal from '@/components/dashboard/EventVideoModal.vue'
import {
  getBlockIdByChildId,
  getCategoryBlocks,
  getCategorySegmentColor,
  getDetailItems,
  getSegmentStyle,
  getSubTypeColor,
  getSubTypeLabel,
  type TimelineDetailItem,
} from '@/utils/productionTimeline'
import { getHeatmapTimeMarks } from '@/utils/heatmap'
import { timeToMinutes, formatDuration } from '@/utils/time'
import { V2_TIMELINE_COLORS } from '@/constants/dashboardV2ChartTheme'
import { V3_TIMELINE_COLORS } from '@/constants/dashboardV3ChartTheme'
import type { TimelineCategory } from '@/utils/productionTimeline'
import type { TimelineEventType } from '@/types/oee'

const props = defineProps<{
  segments: TimelineSegment[]
  eventDetails: Record<string, TimelineEventDetail>
  dayStart?: string
  dayEnd?: string
  timeMarkInterval?: number
  variant?: 'default' | 'muted' | 'v3'
}>()

const isMuted = computed(() => props.variant === 'muted')
const isV3 = computed(() => props.variant === 'v3')

function categoryColor(category: TimelineCategory) {
  if (isV3.value) {
    return category === 'running'
      ? V3_TIMELINE_COLORS.production
      : 'var(--v3-timeline-downtime)'
  }
  if (isMuted.value) {
    return category === 'running'
      ? V2_TIMELINE_COLORS.production
      : V2_TIMELINE_COLORS.unknown_downtime
  }
  return getCategorySegmentColor(category)
}

function subTypeColor(type: TimelineEventType) {
  if (isV3.value) return V3_TIMELINE_COLORS[type]
  if (isMuted.value) return V2_TIMELINE_COLORS[type]
  return getSubTypeColor(type)
}

const V3_SUB_TYPE_LABELS: Partial<Record<TimelineEventType, string>> = {
  fault: '故障停机',
  unknown_downtime: '未知停机',
  personnel_loss: '人员响应损失',
  production_change: '换产',
  face_change: '换面',
  face_change_op: '换面',
}

function displaySubTypeLabel(type: TimelineEventType) {
  if (isV3.value && V3_SUB_TYPE_LABELS[type]) return V3_SUB_TYPE_LABELS[type]!
  return getSubTypeLabel(type)
}

function formatCompactDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const padM = String(m).padStart(2, '0')
  return m > 0 ? `${h}h ${padM}m` : `${h}h`
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

const tableItems = computed(() =>
  detailItems.value.filter(
    (item) =>
      item.subType !== 'production'
      && (item.detail != null || !item.id.includes(':')),
  ),
)

const timeMarks = computed(() =>
  getHeatmapTimeMarks(dayStart.value, dayEnd.value, props.timeMarkInterval ?? 60),
)

const totalMinutes = computed(() =>
  timeToMinutes(dayEnd.value) - timeToMinutes(dayStart.value),
)

const hasSelection = computed(() => selectedId.value != null)

function getChildContext(childId: string) {
  for (const block of blocks.value) {
    const child = block.children.find((item) => item.id === childId)
    if (child) return { block, child }
  }
  return null
}

function overlapsTimeRange(
  a: { start: string; end: string },
  b: { start: string; end: string },
) {
  const aStart = timeToMinutes(a.start)
  const aEnd = timeToMinutes(a.end)
  const bStart = timeToMinutes(b.start)
  const bEnd = timeToMinutes(b.end)
  return aStart < bEnd && bStart < aEnd
}

function isCategorySegmentActive(blockId: string) {
  if (!selectedId.value) return false
  return getBlockIdByChildId(blocks.value, selectedId.value) === blockId
}

function isSubtypeSegmentActive(childId: string) {
  if (!selectedId.value) return false
  if (selectedId.value === childId) return true

  const selected = getChildContext(selectedId.value)
  const current = getChildContext(childId)
  if (!selected || !current) return false

  return overlapsTimeRange(selected.child, current.child)
}

function isTableRowActive(item: TimelineDetailItem) {
  if (!selectedId.value) return false
  if (selectedId.value === item.id) return true

  const selected = getChildContext(selectedId.value)
  if (!selected) return false

  return overlapsTimeRange(selected.child, item)
}

function getMarkTop(time: string) {
  const offset = timeToMinutes(time) - timeToMinutes(dayStart.value)
  return `${(offset / totalMinutes.value) * 100}%`
}

function getMarkStyle(time: string, index: number) {
  const top = getMarkTop(time)
  if (!isV3.value) {
    return { top, transform: 'translateY(-50%)' }
  }
  if (index === 0) {
    return { top: '0', transform: 'translateY(0)' }
  }
  if (index === timeMarks.value.length - 1) {
    return { top: '100%', transform: 'translateY(-100%)' }
  }
  return { top, transform: 'translateY(-50%)' }
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
  const block = blocks.value.find((item) => item.id === blockId)
  if (!block) return

  const preferred = block.children.find((child) =>
    tableItems.value.some((item) => item.id === child.id),
  ) ?? block.children.find((child) =>
    tableItems.value.some((item) => overlapsTimeRange(child, item)),
  ) ?? block.children[0]

  if (!preferred) return
  selectSubEvent(preferred.id)
}

function selectSubEvent(id: string) {
  selectedId.value = id

  const scrollId = tableItems.value.find((item) => item.id === id)?.id
    ?? tableItems.value.find((item) => {
      const ctx = getChildContext(id)
      return ctx ? overlapsTimeRange(ctx.child, item) : false
    })?.id

  if (scrollId) scrollToDetail(scrollId)
}

function openVideo(item: TimelineDetailItem) {
  videoEvent.value = item
  videoModalVisible.value = true
}
</script>

<template>
  <div
    class="production-timeline"
    :class="{
      'production-timeline--muted': isMuted,
      'production-timeline--v3': isV3,
      'production-timeline--has-selection': hasSelection,
    }"
  >
    <div class="production-timeline__track-area">
      <div class="production-timeline__axis">
        <span
          v-if="isV3"
          v-for="mark in timeMarks"
          :key="`grid-${mark}`"
          class="production-timeline__grid-line"
          :style="{ top: getMarkTop(mark) }"
        />
        <span
          v-for="(mark, markIndex) in timeMarks"
          :key="mark"
          class="production-timeline__mark"
          :style="{
            ...getMarkStyle(mark, markIndex),
            animationDelay: getMarkAnimDelay(markIndex),
          }"
        >
          {{ mark }}
        </span>
      </div>

      <div class="production-timeline__tracks-wrap">
        <div class="production-timeline__tracks">
          <div class="production-timeline__track-col production-timeline__track-col--category">
            <div class="production-timeline__track">
              <div
                v-for="block in blocks"
                :key="block.id"
                class="production-timeline__segment"
                :class="{
                  'production-timeline__segment--active': isCategorySegmentActive(block.id),
                  'production-timeline__segment--dimmed':
                    hasSelection && !isCategorySegmentActive(block.id),
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
                      'production-timeline__segment--active': isSubtypeSegmentActive(child.id),
                      'production-timeline__segment--dimmed':
                        hasSelection && !isSubtypeSegmentActive(child.id),
                    }"
                    :style="{
                      ...getSegmentStyle(child, dayStart, dayEnd),
                      background: subTypeColor(child.segmentType),
                      animationDelay: getSegmentAnimDelay(child.start),
                    }"
                    :title="`${displaySubTypeLabel(child.segmentType)} ${child.start}-${child.end}`"
                    @click="selectSubEvent(child.id)"
                  />
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isV3"
      class="production-timeline__table"
    >
      <div class="production-timeline__table-head">
        <span>类型</span>
        <span>开始 ~ 结束</span>
        <span>持续时间</span>
        <span>事件描述</span>
        <span>视频</span>
      </div>
      <div ref="detailListRef" class="production-timeline__table-body">
        <div
          v-for="(item, detailIndex) in tableItems"
          :key="item.id"
          :data-event-id="item.id"
          class="production-timeline__table-row"
          :class="{
            'production-timeline__table-row--active': isTableRowActive(item),
            'production-timeline__table-row--dimmed':
              hasSelection && !isTableRowActive(item),
          }"
          :style="{ animationDelay: getDetailAnimDelay(detailIndex) }"
          @click="selectSubEvent(item.id)"
        >
          <span class="production-timeline__table-type">
            <i
              class="production-timeline__type-dot"
              :style="{ background: subTypeColor(item.subType) }"
            />
            {{ displaySubTypeLabel(item.subType) }}
          </span>
          <span class="production-timeline__table-time">{{ item.start }} ~ {{ item.end }}</span>
          <span class="production-timeline__table-duration">{{ formatCompactDuration(item.duration) }}</span>
          <span class="production-timeline__table-desc">
            {{ item.detail?.description ?? item.label }}
          </span>
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
    </div>

    <div
      v-else
      ref="detailListRef"
      class="production-timeline__details"
    >
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
      :variant="isV3 ? 'v3' : 'default'"
    />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v3/variables' as *;

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

.production-timeline__tracks-wrap {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
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

.production-timeline--v3 {
  gap: 16px;

  .production-timeline__track-area {
    position: relative;
    flex: 0 0 172px;
    width: 172px;
    flex-direction: row;
    gap: 0;
    padding: 0;
  }

  .production-timeline__axis {
    position: absolute;
    top: 10px;
    bottom: 10px;
    left: 0;
    width: 40px;
    border-right: none;
    overflow: visible;
  }

  .production-timeline__tracks-wrap {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    margin-left: 40px;
    gap: 8px;
    padding: 10px 0;
  }

  .production-timeline__tracks {
    flex: 1;
    min-height: 0;
    gap: 8px;
  }

  .production-timeline__track-col {
    flex: 0 0 22px;
    width: 22px;
    min-width: 22px;
    max-width: 22px;
  }

  .production-timeline__track-col--category,
  .production-timeline__track-col--subtype {
    flex: 0 0 22px;
    width: 22px;
    min-width: 22px;
    max-width: 22px;
  }

  .production-timeline__track-col--subtype .production-timeline__track {
    background: transparent;
    border: none;
  }

  .production-timeline__track {
    background: transparent;
    border: none;
  }

  .production-timeline__grid-line {
    position: absolute;
    left: 0;
    right: -132px;
    height: 0;
    border-top: 1px dashed $v3-grid-line;
    pointer-events: none;
  }

  .production-timeline__mark {
    left: 0;
    right: auto;
    padding-left: 2px;
    color: $v3-text-secondary;
    font-size: 11px;
    line-height: 1;
    z-index: 1;
  }

  .production-timeline__segment {
    &--dimmed {
      opacity: 0.32;
      filter: saturate(0.55);
    }

    &--active {
      opacity: 1;
      filter: brightness(1.08);
      box-shadow:
        0 0 0 2px rgba(255, 255, 255, 0.9),
        0 0 14px $v3-neon-green-glow;
      z-index: 3;
    }
  }

  .production-timeline__table {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .production-timeline__table-head,
  .production-timeline__table-row {
    display: grid;
    grid-template-columns: 116px 124px 72px 1fr 48px;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
  }

  .production-timeline__table-head {
    flex-shrink: 0;
    height: 30px;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 500;
    color: $v3-text-secondary;
  }

  .production-timeline__table-body {
    flex: 1;
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
      background: $v3-scrollbar-thumb;
      border-radius: 2px;
    }
  }

  .production-timeline__table-row {
    flex-shrink: 0;
    min-height: 54px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: $v3-control-bg;
    border: 1px solid $v3-control-border;
    border-radius: $v3-radius-md;
    cursor: pointer;
    animation: timeline-detail-enter 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
    transition: border-color $v3-transition, background $v3-transition, box-shadow $v3-transition, opacity $v3-transition;

    &:hover {
      background: $v3-control-bg-hover;
      border-color: $v3-control-border-hover;
    }

    &--dimmed {
      opacity: 0.42;
    }

    &--active {
      opacity: 1;
      border-color: $v3-control-focus-border;
      background: $v3-neon-green-dim;
      box-shadow: 0 0 12px $v3-neon-green-soft;
    }
  }

  .production-timeline__table-type {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 500;
    color: $v3-text;
    white-space: nowrap;
  }

  .production-timeline__type-dot {
    flex-shrink: 0;
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }

  .production-timeline__table-time,
  .production-timeline__table-duration {
    font-size: 14px;
    color: $v3-text-secondary;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .production-timeline__table-desc {
    font-size: 14px;
    color: $v3-text-secondary;
    line-height: 1.45;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .production-timeline__play-btn {
    justify-self: center;
    width: 32px;
    height: 32px;
    border-color: $v3-neon-green-border;
    background: $v3-neon-green-soft;
    color: $v3-neon-green;

    svg {
      width: 13px;
      height: 13px;
    }

    &:hover {
      border-color: $v3-control-focus-border;
      background: $v3-neon-green-hover-bg;
      color: $v3-neon-green;
    }
  }
}
</style>
