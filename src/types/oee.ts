export type EquipmentStatus = 'running' | 'stopped' | 'fault'

export type TimelineEventType =
  | 'production'
  | 'face_change'
  | 'production_change'
  | 'fault'
  | 'personnel_loss'
  | 'face_change_op'
  | 'unknown_downtime'

export type HeatmapEventType =
  | 'running'
  | 'face_change'
  | 'production_change'
  | 'fault'
  | 'unknown'
  | 'idle'

export interface HeatmapCell {
  index: number
  start: string
  end: string
  type: HeatmapEventType
  label: string
  duration: number
  description?: string
  operator?: string
  product?: string
  reason?: string
}

export interface TimelineSegment {
  id: string
  type: TimelineEventType
  label: string
  start: string
  end: string
  duration: number
  parentId?: string
}

export interface TimelineEventDetail {
  id: string
  type: TimelineEventType
  title: string
  start: string
  end: string
  duration: number
  description: string
  operator?: string
  product?: string
  reason?: string
}

export interface DowntimeItem {
  name: string
  value: number
  color: string
}

export interface DailyCoverageItem {
  date: string
  rate: number
}

export interface KeyTimeMetrics {
  runningTime: number
  plannedDowntime: number
  unplannedDowntime: number
}

export type MetricDayChange = 'up' | 'down'

export interface FocusMetricTrends {
  personnelLossDuration: number[]
  personnelLossCount: number[]
  faceChangeCount: number[]
  productionChangeCount: number[]
  avgFaceChangeTime: number[]
  avgProductionChangeTime: number[]
}

export interface FocusMetricDayChanges {
  personnelLossDuration: MetricDayChange
  personnelLossCount: MetricDayChange
  faceChangeCount: MetricDayChange
  productionChangeCount: MetricDayChange
  avgFaceChangeTime: MetricDayChange
  avgProductionChangeTime: MetricDayChange
}

export interface OeeMetrics {
  availabilityRate: number
  equipmentStatus: EquipmentStatus
  equipmentStatusNote?: string
  equipmentStatusDuration?: number
  equipmentStatusDurations?: Partial<Record<EquipmentStatus, number>>
  personnelLossDuration: number
  personnelLossCount: number
  faceChangeCount: number
  productionChangeCount: number
  avgFaceChangeTime: number
  focusMetricTrends: FocusMetricTrends
  focusMetricDayChanges: FocusMetricDayChanges
  avgProductionChangeTime: number
  totalFaceChangeTime: number
  totalProductionChangeTime: number
  visualRecognitionRate: number
  visualRecognitionDaily: DailyCoverageItem[]
  keyTimeMetrics: KeyTimeMetrics
  workingMinutes: number
  faultDowntime: number
  downtimeAnalysis: DowntimeItem[]
  timeline: TimelineSegment[]
  eventDetails: Record<string, TimelineEventDetail>
}
