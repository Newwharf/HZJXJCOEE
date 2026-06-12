import type { HeatmapEventType, TimelineEventType } from '@/types/oee'

/** 优化版大屏 — 低饱和语义色 */
export const V2_HEATMAP_COLORS: Record<HeatmapEventType, string> = {
  running: '#5a9a78',
  face_change: '#b8954a',
  production_change: '#8a7eb8',
  fault: '#b87070',
  unknown: '#788898',
  idle: '#1e2633',
}

export const V2_TIMELINE_COLORS: Record<TimelineEventType, string> = {
  production: '#5a9a78',
  face_change: '#b8954a',
  face_change_op: '#c4a860',
  production_change: '#8a7eb8',
  fault: '#b87070',
  personnel_loss: '#b08090',
  unknown_downtime: '#788898',
}

export const V2_DOWNTIME_COLORS: Record<string, string> = {
  故障: '#b87070',
  人员响应损失: '#b08090',
  未知停机: '#788898',
}

export const V2_CHART_UI = {
  axis: '#3d4a58',
  axisLabel: '#64748b',
  splitLine: '#252f3d',
  tooltipBg: '#121820',
  tooltipBorder: '#2d3a4f',
  tooltipText: '#cbd5e1',
  centerValue: '#94a3b8',
  centerLabel: '#64748b',
  bar: '#7a8a9a',
  pieBorder: '#121820',
}

export const V2_MACHINE_STATUS = {
  running: { label: '运行中', color: '#5a9a78' },
  stopped: { label: '停机', color: '#788898' },
  fault: { label: '故障', color: '#b87070' },
} as const

export const V2_MACHINE_METRICS = [
  { key: 'runningTime' as const, label: '负载运行时间', color: '#5a9a78' },
  { key: 'plannedDowntime' as const, label: '计划内停机时间', color: '#b8954a' },
  { key: 'unplannedDowntime' as const, label: '计划外停机时间', color: '#b87070' },
]
