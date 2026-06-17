<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import type { TimelineSegment, TimelineEventDetail, HeatmapCell } from '@/types/oee'
import { HEATMAP_COLORS, HEATMAP_LABELS, HEATMAP_LEGEND } from '@/constants/heatmap'
import {
  buildHeatmapCells,
  getHeatmapTimeMarks,
  HEATMAP_GRID_COLS,
  HEATMAP_GRID_ROWS,
  HEATMAP_GAP,
  getHeatmapMinutesPerColumn,
} from '@/utils/heatmap'
import { timeToMinutes } from '@/utils/time'
import { V2_HEATMAP_COLORS } from '@/constants/dashboardV2ChartTheme'
import { getV3HeatmapColors } from '@/constants/dashboardV3ChartTheme'
import { DASHBOARD_V3_THEME_KEY } from '@/composables/useDashboardV3Theme'

const props = withDefaults(
  defineProps<{
    segments: TimelineSegment[]
    eventDetails: Record<string, TimelineEventDetail>
    dayStart?: string
    dayEnd?: string
    variant?: 'default' | 'muted' | 'v3'
    gridCols?: number
    gridRows?: number
    showLegend?: boolean
    timeMarkInterval?: number
    /** 仅按容器宽度计算方块尺寸，避免被高度限制 */
    sizeByWidth?: boolean
    minCellSize?: number
    maxCellSize?: number
    /** 高度随内容收缩，不占满父容器（用于事件分布等复合卡片） */
    autoHeight?: boolean
  }>(),
  {
    dayStart: '08:00',
    dayEnd: '20:00',
    variant: 'default',
    showLegend: true,
    timeMarkInterval: 120,
    sizeByWidth: false,
    minCellSize: 4,
    autoHeight: false,
  },
)

const isMuted = computed(() => props.variant === 'muted')
const isV3 = computed(() => props.variant === 'v3')
const themeContext = inject(DASHBOARD_V3_THEME_KEY, null)

const heatmapColors = computed(() => {
  if (props.variant === 'v3') {
    return getV3HeatmapColors(themeContext?.theme.value ?? 'dark')
  }
  if (props.variant === 'muted') return V2_HEATMAP_COLORS
  return HEATMAP_COLORS
})

const wrapRef = ref<HTMLElement | null>(null)
const cellSize = ref(8)
const hoveredCell = ref<HeatmapCell | null>(null)
const tooltipPos = ref({ x: 0, y: 0 })

let resizeObserver: ResizeObserver | null = null

const dayStart = computed(() => props.dayStart)
const dayEnd = computed(() => props.dayEnd)

const gridCols = computed(() => props.gridCols ?? HEATMAP_GRID_COLS)
const gridRows = computed(() => props.gridRows ?? HEATMAP_GRID_ROWS)

const cells = computed(() =>
  buildHeatmapCells(
    props.segments,
    props.eventDetails,
    dayStart.value,
    dayEnd.value,
    gridCols.value,
    gridRows.value,
  ),
)

const timeMarks = computed(() =>
  getHeatmapTimeMarks(dayStart.value, dayEnd.value, props.timeMarkInterval),
)

const gridWidth = computed(
  () => gridCols.value * cellSize.value + (gridCols.value - 1) * HEATMAP_GAP,
)

const gridHeight = computed(
  () => gridRows.value * cellSize.value + (gridRows.value - 1) * HEATMAP_GAP,
)

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gridCols.value}, ${cellSize.value}px)`,
  gridTemplateRows: `repeat(${gridRows.value}, ${cellSize.value}px)`,
  gridAutoFlow: 'column' as const,
  gap: `${HEATMAP_GAP}px`,
  width: `${gridWidth.value}px`,
  height: `${gridHeight.value}px`,
}))

const columnTicks = computed(() =>
  Array.from({ length: gridCols.value + 1 }, (_, i) => i),
)

function updateCellSize() {
  const wrap = wrapRef.value
  if (!wrap) return

  const maxW = wrap.clientWidth
  const maxH = wrap.clientHeight
  const sizeByW = (maxW - (gridCols.value - 1) * HEATMAP_GAP) / gridCols.value
  const sizeByH = (maxH - (gridRows.value - 1) * HEATMAP_GAP) / gridRows.value
  const rawSize = props.sizeByWidth ? sizeByW : Math.min(sizeByW, sizeByH)
  const floored = Math.floor(rawSize)
  const capped = props.maxCellSize != null ? Math.min(floored, props.maxCellSize) : floored
  cellSize.value = Math.max(props.minCellSize, capped)
}

function getColumnLeft(column: number) {
  return `${column * (cellSize.value + HEATMAP_GAP)}px`
}

function getMarkPosition(time: string) {
  const offset = timeToMinutes(time) - timeToMinutes(dayStart.value)
  const minutesPerColumn = getHeatmapMinutesPerColumn(dayStart.value, dayEnd.value, gridCols.value)
  const column = offset / minutesPerColumn
  return getColumnLeft(column)
}

function handleCellEnter(cell: HeatmapCell, event: MouseEvent) {
  hoveredCell.value = cell
  updateTooltipPos(event)
}

function handleCellMove(event: MouseEvent) {
  updateTooltipPos(event)
}

function handleCellLeave() {
  hoveredCell.value = null
}

function updateTooltipPos(event: MouseEvent) {
  tooltipPos.value = { x: event.clientX, y: event.clientY }
}

onMounted(() => {
  updateCellSize()
  resizeObserver = new ResizeObserver(updateCellSize)
  if (wrapRef.value) {
    resizeObserver.observe(wrapRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <div
    class="timeline-heatmap"
    :class="{
      'timeline-heatmap--muted': isMuted,
      'timeline-heatmap--v3': isV3,
      'timeline-heatmap--auto-height': autoHeight,
    }"
  >
    <div v-if="showLegend" class="timeline-heatmap__legend">
      <span
        v-for="type in HEATMAP_LEGEND"
        :key="type"
        class="timeline-heatmap__legend-item"
      >
        <i :style="{ background: heatmapColors[type] }" />
        {{ HEATMAP_LABELS[type] }}
      </span>
    </div>

    <div ref="wrapRef" class="timeline-heatmap__grid-wrap">
      <div class="timeline-heatmap__board">
        <div class="timeline-heatmap__grid" :style="gridStyle">
          <div
            v-for="cell in cells"
            :key="cell.index"
            class="timeline-heatmap__cell"
            :class="`timeline-heatmap__cell--${cell.type}`"
            :style="{
              background: heatmapColors[cell.type],
              animationDelay: `${cell.index * 6}ms`,
            }"
            @mouseenter="handleCellEnter(cell, $event)"
            @mousemove="handleCellMove"
            @mouseleave="handleCellLeave"
          />
        </div>

        <div class="timeline-heatmap__axis" :style="{ width: `${gridWidth}px` }">
          <span
            v-for="tick in columnTicks"
            :key="tick"
            class="timeline-heatmap__tick"
            :style="{ left: getColumnLeft(tick) }"
          />
          <span
            v-for="mark in timeMarks"
            :key="mark"
            class="timeline-heatmap__mark"
            :style="{ left: getMarkPosition(mark) }"
          >
            {{ mark }}
          </span>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="hoveredCell"
        class="timeline-heatmap__tooltip"
        :style="{ left: `${tooltipPos.x + 12}px`, top: `${tooltipPos.y - 8}px` }"
      >
        <div class="timeline-heatmap__tooltip-title">
          {{ HEATMAP_LABELS[hoveredCell.type] }}
        </div>
        <div class="timeline-heatmap__tooltip-row">
          <span>时间段</span>
          <span>{{ hoveredCell.start }} — {{ hoveredCell.end }}</span>
        </div>
        <div class="timeline-heatmap__tooltip-row">
          <span>时长</span>
          <span>{{ hoveredCell.duration }} 分钟</span>
        </div>
        <div v-if="hoveredCell.product" class="timeline-heatmap__tooltip-row">
          <span>产品</span>
          <span>{{ hoveredCell.product }}</span>
        </div>
        <div v-if="hoveredCell.operator" class="timeline-heatmap__tooltip-row">
          <span>操作人</span>
          <span>{{ hoveredCell.operator }}</span>
        </div>
        <div v-if="hoveredCell.reason" class="timeline-heatmap__tooltip-row">
          <span>原因</span>
          <span>{{ hoveredCell.reason }}</span>
        </div>
        <div v-if="hoveredCell.description" class="timeline-heatmap__tooltip-desc">
          {{ hoveredCell.description }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v3/variables' as *;

.timeline-heatmap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.timeline-heatmap__legend {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  padding: 0 2px;
}

.timeline-heatmap__legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(232, 244, 255, 0.65);

  i {
    display: inline-block;
    width: 11px;
    height: 11px;
    border-radius: 2px;
  }
}

.timeline-heatmap__grid-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-heatmap__board {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 100%;
  max-height: 100%;
}

.timeline-heatmap__grid {
  display: grid;
  flex-shrink: 0;
}

.timeline-heatmap__cell {
  width: 100%;
  height: 100%;
  border-radius: 2px;
  border: 1px solid rgba(0, 212, 255, 0.06);
  cursor: pointer;
  transition: box-shadow 0.12s, filter 0.12s, opacity 0.12s;
  opacity: 0.88;
  transform-origin: center center;
  animation: heatmap-cell-enter 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;

  &:hover {
    opacity: 1;
    box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.5);
    filter: brightness(1.15);
    z-index: 2;
    position: relative;
  }

  &--idle {
    opacity: 0.45;

    &:hover {
      opacity: 0.7;
    }
  }
}

.timeline-heatmap--muted {
  .timeline-heatmap__legend-item {
    color: #64748b;
  }

  .timeline-heatmap__cell {
    border-color: #252f3d;
    opacity: 0.92;

    &:hover {
      box-shadow: 0 0 0 1px #475569;
      filter: brightness(1.05);
    }
  }

  .timeline-heatmap__axis {
    border-top-color: #252f3d;
  }

  .timeline-heatmap__tick {
    background: #3d4a58;
  }

  .timeline-heatmap__mark {
    color: #64748b;
  }
}

.timeline-heatmap--v3 {
  .timeline-heatmap__legend-item {
    color: $v3-text-secondary;
    font-size: 10px;
  }

  .timeline-heatmap__cell {
    border-color: $v3-heatmap-cell-border;
    border-radius: 4px;
    opacity: 0.95;

    &:hover {
      box-shadow: 0 0 0 1px $v3-control-focus-border;
      filter: brightness(1.1);
    }
  }

  .timeline-heatmap__axis {
    border-top-color: $v3-heatmap-axis;
  }

  .timeline-heatmap__tick {
    background: $v3-heatmap-tick;
  }

  .timeline-heatmap__mark {
    color: $v3-text-secondary;
    font-size: 11px;
  }
}

.timeline-heatmap--auto-height {
  height: auto;
  min-height: 0;
  overflow: visible;

  .timeline-heatmap__grid-wrap {
    flex: 0 0 auto;
    height: auto;
    min-height: 0;
    overflow: visible;
    align-items: flex-start;
    justify-content: stretch;
  }

  .timeline-heatmap__board {
    width: 100%;
    max-height: none;
  }
}

.timeline-heatmap__axis {
  position: relative;
  flex-shrink: 0;
  height: 20px;
  border-top: 1px solid rgba(0, 212, 255, 0.12);
}

.timeline-heatmap__tick {
  position: absolute;
  top: 0;
  width: 1px;
  height: 6px;
  background: rgba(0, 212, 255, 0.2);
  transform: translateX(-0.5px);
}

.timeline-heatmap__mark {
  position: absolute;
  top: 8px;
  transform: translateX(0);
  font-size: 10px;
  color: rgba(232, 244, 255, 0.45);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  animation: heatmap-mark-enter 0.5s ease both;
}

@keyframes heatmap-cell-enter {
  from {
    opacity: 0;
    transform: scale(0.2);
  }

  to {
    opacity: 0.88;
    transform: scale(1);
  }
}

@keyframes heatmap-mark-enter {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<style lang="scss">
.timeline-heatmap__tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  min-width: 180px;
  max-width: 260px;
  padding: 10px 12px;
  background: rgba(6, 30, 60, 0.95);
  border: 1px solid rgba(0, 212, 255, 0.35);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  transform: translateY(-100%);
}

.timeline-heatmap__tooltip-title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #00d4ff;
}

.timeline-heatmap__tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  line-height: 1.6;
  color: rgba(232, 244, 255, 0.85);

  span:first-child {
    flex-shrink: 0;
    color: rgba(232, 244, 255, 0.45);
  }
}

.timeline-heatmap__tooltip-desc {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(0, 212, 255, 0.15);
  font-size: 11px;
  line-height: 1.5;
  color: rgba(232, 244, 255, 0.65);
}
</style>
