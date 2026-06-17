import type { DashboardV3Theme } from '@/composables/useDashboardV3Theme'
import type { HeatmapEventType, TimelineEventType } from '@/types/oee'

/** V3 大屏 — 事件语义色（深浅模式共用） */
export const V3_HEATMAP_COLORS: Record<HeatmapEventType, string> = {
  running: '#a6e22e',
  face_change: '#13c2c2',
  production_change: '#9254de',
  fault: '#fa8c16',
  unknown: '#409eff',
  idle: '#1a222d',
}

export const V3_HEATMAP_COLORS_LIGHT: Record<HeatmapEventType, string> = {
  ...V3_HEATMAP_COLORS,
  idle: '#e2e8f0',
}

export const V3_TIMELINE_COLORS: Record<TimelineEventType, string> = {
  production: '#95de64',
  face_change: '#40a9ff',
  face_change_op: '#40a9ff',
  production_change: '#5cdbd3',
  fault: '#ff4d4f',
  personnel_loss: '#b37feb',
  unknown_downtime: '#ffec3d',
}

export const V3_DOWNTIME_COLORS: Record<string, string> = {
  未知停机: '#a6e22e',
  故障: '#409eff',
  故障停机: '#409eff',
  人员响应损失: '#9254de',
}

const V3_CHART_UI_DARK = {
  axis: 'rgba(100, 116, 139, 0.25)',
  axisLabel: '#64748b',
  splitLine: 'rgba(100, 116, 139, 0.12)',
  tooltipBg: '#131a24',
  tooltipBorder: '#1f2937',
  tooltipText: '#e2e8f0',
  centerValue: '#f1f5f9',
  centerLabel: '#64748b',
  bar: '#a6e22e',
  pieBorder: '#0a0e14',
  shadowColor: 'rgba(0, 0, 0, 0.35)',
}

const V3_CHART_UI_LIGHT = {
  axis: 'rgba(15, 23, 42, 0.12)',
  axisLabel: '#64748b',
  splitLine: 'rgba(15, 23, 42, 0.08)',
  tooltipBg: '#ffffff',
  tooltipBorder: '#e2e8f0',
  tooltipText: '#1e293b',
  centerValue: '#1e293b',
  centerLabel: '#64748b',
  bar: '#5a8f00',
  pieBorder: '#ffffff',
  shadowColor: 'rgba(15, 23, 42, 0.12)',
}

/** @deprecated 使用 getV3ChartUI(theme) */
export const V3_CHART_UI = V3_CHART_UI_DARK

export function getV3ChartUI(theme: DashboardV3Theme = 'dark') {
  return theme === 'light' ? V3_CHART_UI_LIGHT : V3_CHART_UI_DARK
}

export function getV3HeatmapColors(theme: DashboardV3Theme = 'dark') {
  return theme === 'light' ? V3_HEATMAP_COLORS_LIGHT : V3_HEATMAP_COLORS
}

export const V3_METRIC_COLORS = {
  personnelDuration: '#a6e22e',
  personnelCount: '#fadb14',
  avgFaceTime: '#13c2c2',
  faceCount: '#409eff',
  avgProdTime: '#9254de',
  prodCount: '#9254de',
} as const

export const V3_METRIC_COLORS_LIGHT = {
  personnelDuration: '#5a8f00',
  personnelCount: '#ca8a04',
  avgFaceTime: '#0d9488',
  faceCount: '#2563eb',
  avgProdTime: '#7c3aed',
  prodCount: '#7c3aed',
} as const

export function getV3MetricColors(theme: DashboardV3Theme = 'dark') {
  return theme === 'light' ? V3_METRIC_COLORS_LIGHT : V3_METRIC_COLORS
}
