import type { TimelineEventType, TimelineSegment, TimelineEventDetail } from '@/types/oee'
import { TIMELINE_COLORS } from '@/constants/timeline'
import { minutesToTime, timeToMinutes } from '@/utils/time'

export type TimelineCategory = 'running' | 'downtime'

export interface TimelineSubEvent {
  id: string
  segmentType: TimelineEventType
  label: string
  start: string
  end: string
  duration: number
  detail?: TimelineEventDetail
}

export interface TimelineCategoryBlock {
  id: string
  category: TimelineCategory
  categoryLabel: string
  start: string
  end: string
  duration: number
  parentType: TimelineEventType
  children: TimelineSubEvent[]
  detail?: TimelineEventDetail
}

export interface TimelineDetailItem {
  id: string
  blockId: string
  isChild: boolean
  category: TimelineCategory
  categoryLabel: string
  subType: TimelineEventType
  subTypeLabel: string
  label: string
  start: string
  end: string
  duration: number
  detail?: TimelineEventDetail
}

export function getCategorySegmentColor(category: TimelineCategory): string {
  return category === 'running'
    ? TIMELINE_COLORS.production
    : TIMELINE_COLORS.unknown_downtime
}

const SUB_TYPE_LABELS: Record<TimelineEventType, string> = {
  production: '负载运行',
  face_change: '换面',
  face_change_op: '换面',
  production_change: '换产',
  fault: '故障',
  personnel_loss: '人员响应损失',
  unknown_downtime: '未知停机',
}

export function getSubTypeLabel(type: TimelineEventType): string {
  return SUB_TYPE_LABELS[type]
}

export function getSubTypeColor(type: TimelineEventType): string {
  return TIMELINE_COLORS[type]
}

function resolveBlockRange(
  segment: TimelineSegment,
  rawChildren: TimelineSegment[],
) {
  const startMin = timeToMinutes(segment.start)
  let endMin = timeToMinutes(segment.end)

  for (const child of rawChildren) {
    endMin = Math.max(endMin, timeToMinutes(child.end))
  }

  return {
    start: segment.start,
    end: minutesToTime(endMin),
    duration: endMin - startMin,
  }
}

function mapTimelineSubEvent(
  segment: TimelineSegment,
  eventDetails: Record<string, TimelineEventDetail>,
  id = segment.id,
): TimelineSubEvent {
  return {
    id,
    segmentType: segment.type,
    label: segment.label,
    start: segment.start,
    end: segment.end,
    duration: segment.duration,
    detail: eventDetails[segment.id],
  }
}

function buildDowntimeChildren(
  segment: TimelineSegment,
  rawChildren: TimelineSegment[],
  eventDetails: Record<string, TimelineEventDetail>,
  rangeEnd: string,
): TimelineSubEvent[] {
  if (rawChildren.length === 0) {
    return [mapTimelineSubEvent(segment, eventDetails)]
  }

  const children: TimelineSubEvent[] = []
  let cursorMin = timeToMinutes(segment.start)
  const rangeEndMin = timeToMinutes(rangeEnd)

  for (const child of rawChildren) {
    const childStartMin = timeToMinutes(child.start)
    const childEndMin = timeToMinutes(child.end)

    if (childStartMin > cursorMin) {
      children.push({
        id: `${segment.id}:main`,
        segmentType: segment.type,
        label: segment.label,
        start: minutesToTime(cursorMin),
        end: child.start,
        duration: childStartMin - cursorMin,
        detail: eventDetails[segment.id],
      })
    }

    children.push(mapTimelineSubEvent(child, eventDetails))
    cursorMin = childEndMin
  }

  if (cursorMin < rangeEndMin) {
    children.push({
      id: `${segment.id}:tail`,
      segmentType: segment.type,
      label: segment.label,
      start: minutesToTime(cursorMin),
      end: rangeEnd,
      duration: rangeEndMin - cursorMin,
      detail: eventDetails[segment.id],
    })
  }

  return children
}

export function getCategoryBlocks(
  segments: TimelineSegment[],
  eventDetails: Record<string, TimelineEventDetail>,
): TimelineCategoryBlock[] {
  const childrenByParent = new Map<string, TimelineSegment[]>()

  for (const segment of segments) {
    if (!segment.parentId) continue
    const list = childrenByParent.get(segment.parentId) ?? []
    list.push(segment)
    childrenByParent.set(segment.parentId, list)
  }

  return segments
    .filter((segment) => !segment.parentId)
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
    .map((segment) => {
      const isRunning = segment.type === 'production'
      const rawChildren = (childrenByParent.get(segment.id) ?? [])
        .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
      const range = resolveBlockRange(segment, rawChildren)

      let children: TimelineSubEvent[]

      if (isRunning) {
        children = [{
          id: segment.id,
          segmentType: 'production',
          label: segment.label,
          start: range.start,
          end: range.end,
          duration: range.duration,
          detail: eventDetails[segment.id],
        }]
      } else {
        children = buildDowntimeChildren(
          segment,
          rawChildren,
          eventDetails,
          range.end,
        )
      }

      return {
        id: segment.id,
        category: isRunning ? 'running' : 'downtime',
        categoryLabel: isRunning ? '负载运行' : '停机',
        start: range.start,
        end: range.end,
        duration: range.duration,
        parentType: segment.type,
        children,
        detail: eventDetails[segment.id],
      }
    })
}

export function getDetailItems(blocks: TimelineCategoryBlock[]): TimelineDetailItem[] {
  return blocks.flatMap((block) =>
    block.children.map((child) => ({
      id: child.id,
      blockId: block.id,
      isChild: false,
      category: block.category,
      categoryLabel: block.categoryLabel,
      subType: child.segmentType,
      subTypeLabel: getSubTypeLabel(child.segmentType),
      label: child.detail?.title ?? child.label,
      start: child.start,
      end: child.end,
      duration: child.duration,
      detail: child.detail,
    })),
  )
}

export function getFirstChildId(
  blocks: TimelineCategoryBlock[],
  blockId: string,
): string | null {
  const block = blocks.find((item) => item.id === blockId)
  return block?.children[0]?.id ?? null
}

export function getBlockIdByChildId(
  blocks: TimelineCategoryBlock[],
  childId: string,
): string | null {
  return blocks.find((block) =>
    block.children.some((child) => child.id === childId),
  )?.id ?? null
}

export function getSegmentStyle(
  event: { start: string; duration: number },
  dayStart: string,
  dayEnd: string,
) {
  const startMin = timeToMinutes(dayStart)
  const endMin = timeToMinutes(dayEnd)
  const total = endMin - startMin
  const offset = timeToMinutes(event.start) - startMin
  const top = (offset / total) * 100
  const height = (event.duration / total) * 100
  const safeHeight = Math.max(height, 0.5)

  return {
    top: `${top}%`,
    height: `calc(${safeHeight}% + 1px)`,
  }
}

export function getCategoryDisplayLabel(block: TimelineCategoryBlock): string {
  if (block.duration < 28) {
    return block.category === 'running' ? '运行' : '停机'
  }
  return block.categoryLabel
}
