import type { HeatmapCell, HeatmapEventType, TimelineSegment, TimelineEventDetail } from '@/types/oee'
import {
  HEATMAP_LABELS,
  compareHeatmapPriority,
  mapSegmentToHeatmap,
} from '@/constants/heatmap'
import { timeToMinutes } from '@/utils/time'

export const HEATMAP_GRID_COLS = 24
export const HEATMAP_GRID_ROWS = 12
export const HEATMAP_TOTAL_CELLS = HEATMAP_GRID_COLS * HEATMAP_GRID_ROWS
export const HEATMAP_GAP = 2

function minutesToTime(minutes: number): string {
  const total = Math.round(minutes)
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function getHeatmapMinutesPerColumn(
  dayStart: string,
  dayEnd: string,
  gridCols = HEATMAP_GRID_COLS,
): number {
  return (timeToMinutes(dayEnd) - timeToMinutes(dayStart)) / gridCols
}

export function getHeatmapSlotMinutes(
  dayStart: string,
  dayEnd: string,
  gridCols = HEATMAP_GRID_COLS,
  gridRows = HEATMAP_GRID_ROWS,
): number {
  return (timeToMinutes(dayEnd) - timeToMinutes(dayStart)) / (gridCols * gridRows)
}

export function buildHeatmapCells(
  segments: TimelineSegment[],
  eventDetails: Record<string, TimelineEventDetail>,
  dayStart = '08:00',
  dayEnd = '20:00',
  gridCols = HEATMAP_GRID_COLS,
  gridRows = HEATMAP_GRID_ROWS,
): HeatmapCell[] {
  const startMin = timeToMinutes(dayStart)
  const endMin = timeToMinutes(dayEnd)
  const totalCells = gridCols * gridRows
  const slotMinutes = getHeatmapSlotMinutes(dayStart, dayEnd, gridCols, gridRows)
  const cells: HeatmapCell[] = []

  for (let i = 0; i < totalCells; i++) {
    const slotStart = startMin + i * slotMinutes
    const slotEnd = Math.min(slotStart + slotMinutes, endMin)
    const midpoint = slotStart + (slotEnd - slotStart) / 2

    const covering = segments.filter((seg) => {
      const segStart = timeToMinutes(seg.start)
      const segEnd = timeToMinutes(seg.end)
      return midpoint >= segStart && midpoint < segEnd
    })

    let heatmapType: HeatmapEventType = 'idle'
    let matchedSegment: TimelineSegment | null = null

    if (covering.length > 0) {
      const sorted = [...covering].sort((a, b) => {
        const typeDiff = compareHeatmapPriority(
          mapSegmentToHeatmap(a.type),
          mapSegmentToHeatmap(b.type),
        )
        if (typeDiff !== 0) return typeDiff
        if (a.parentId && !b.parentId) return -1
        if (!a.parentId && b.parentId) return 1
        return b.duration - a.duration
      })
      matchedSegment = sorted[0]
      heatmapType = mapSegmentToHeatmap(matchedSegment.type)
    }

    const detail = matchedSegment ? eventDetails[matchedSegment.id] : undefined

    cells.push({
      index: i,
      start: minutesToTime(slotStart),
      end: minutesToTime(slotEnd),
      type: heatmapType,
      label: matchedSegment?.label ?? HEATMAP_LABELS.idle,
      duration: slotEnd - slotStart,
      description: detail?.description,
      operator: detail?.operator,
      product: detail?.product,
      reason: detail?.reason,
    })
  }

  return cells
}

export function getHeatmapTimeMarks(dayStart: string, dayEnd: string, intervalMinutes = 120): string[] {
  const startMin = timeToMinutes(dayStart)
  const endMin = timeToMinutes(dayEnd)
  const marks: string[] = []

  for (let m = startMin; m <= endMin; m += intervalMinutes) {
    marks.push(minutesToTime(m))
  }

  return marks
}
