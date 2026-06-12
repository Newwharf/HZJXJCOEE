import type { HeatmapEventType, TimelineEventType } from '@/types/oee'

export const HEATMAP_COLORS: Record<HeatmapEventType, string> = {
  running: '#00e5a0',
  face_change: '#ffaa00',
  production_change: '#7b61ff',
  fault: '#ff4d6a',
  unknown: '#8ba4c7',
  idle: 'rgba(0, 40, 80, 0.55)',
}

export const HEATMAP_LABELS: Record<HeatmapEventType, string> = {
  running: '负载运行时间',
  face_change: '换面时间',
  production_change: '换产时间',
  fault: '故障时间',
  unknown: '未知停机时间',
  idle: '无数据',
}

export const HEATMAP_LEGEND: HeatmapEventType[] = [
  'running',
  'face_change',
  'production_change',
  'fault',
  'unknown',
]

const TYPE_PRIORITY: Record<HeatmapEventType, number> = {
  fault: 5,
  unknown: 4,
  production_change: 3,
  face_change: 2,
  running: 1,
  idle: 0,
}

export function mapSegmentToHeatmap(type: TimelineEventType): HeatmapEventType {
  const mapping: Record<TimelineEventType, HeatmapEventType> = {
    production: 'running',
    face_change: 'face_change',
    face_change_op: 'face_change',
    production_change: 'production_change',
    fault: 'fault',
    personnel_loss: 'unknown',
    unknown_downtime: 'unknown',
  }
  return mapping[type]
}

export function compareHeatmapPriority(a: HeatmapEventType, b: HeatmapEventType): number {
  return TYPE_PRIORITY[b] - TYPE_PRIORITY[a]
}
