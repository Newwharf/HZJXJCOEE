import type { EquipmentStatus, OeeMetrics } from '@/types/oee'
import { oeeDashboardData } from '@/mock/oeeDashboard'

export const DEFAULT_DASHBOARD_DATE = '2026-06-10'
export const DASHBOARD_DATE_MIN = '2026-06-04'
export const DASHBOARD_DATE_MAX = '2026-06-10'

interface DayOverride {
  equipmentStatus: EquipmentStatus
  equipmentStatusNote?: string
  equipmentStatusDuration?: number
  equipmentStatusDurations?: Partial<Record<EquipmentStatus, number>>
  availabilityRate: number
  personnelLossDuration: number
  personnelLossCount: number
  faceChangeCount: number
  productionChangeCount: number
  avgFaceChangeTime: number
  avgProductionChangeTime: number
  keyTimeMetrics: OeeMetrics['keyTimeMetrics']
  downtimeAnalysis: OeeMetrics['downtimeAnalysis']
}

const DAY_OVERRIDES: Record<string, DayOverride> = {
  '2026-06-10': {
    equipmentStatus: 'stopped',
    equipmentStatusNote: '正在等待人员响应',
    equipmentStatusDuration: 13,
    equipmentStatusDurations: {
      running: 88,
      stopped: 13,
      fault: 35,
    },
    availabilityRate: 83.96,
    personnelLossDuration: 32,
    personnelLossCount: 5,
    faceChangeCount: 8,
    productionChangeCount: 3,
    avgFaceChangeTime: 8.5,
    avgProductionChangeTime: 31.7,
    keyTimeMetrics: { runningTime: 500, plannedDowntime: 115, unplannedDowntime: 105 },
    downtimeAnalysis: [
      { name: '故障', value: 45, color: '#ff4d6a' },
      { name: '人员响应损失', value: 32, color: '#ff6b9d' },
      { name: '未知停机', value: 28, color: '#8ba4c7' },
    ],
  },
  '2026-06-09': {
    equipmentStatus: 'running',
    availabilityRate: 86.4,
    personnelLossDuration: 28,
    personnelLossCount: 4,
    faceChangeCount: 7,
    productionChangeCount: 3,
    avgFaceChangeTime: 8.0,
    avgProductionChangeTime: 29.1,
    keyTimeMetrics: { runningTime: 520, plannedDowntime: 108, unplannedDowntime: 92 },
    downtimeAnalysis: [
      { name: '故障', value: 38, color: '#ff4d6a' },
      { name: '人员响应损失', value: 26, color: '#ff6b9d' },
      { name: '未知停机', value: 28, color: '#8ba4c7' },
    ],
  },
  '2026-06-08': {
    equipmentStatus: 'stopped',
    availabilityRate: 83.1,
    personnelLossDuration: 34,
    personnelLossCount: 5,
    faceChangeCount: 8,
    productionChangeCount: 2,
    avgFaceChangeTime: 9.1,
    avgProductionChangeTime: 33.4,
    keyTimeMetrics: { runningTime: 485, plannedDowntime: 120, unplannedDowntime: 115 },
    downtimeAnalysis: [
      { name: '故障', value: 52, color: '#ff4d6a' },
      { name: '人员响应损失', value: 36, color: '#ff6b9d' },
      { name: '未知停机', value: 27, color: '#8ba4c7' },
    ],
  },
  '2026-06-07': {
    equipmentStatus: 'running',
    availabilityRate: 85.6,
    personnelLossDuration: 22,
    personnelLossCount: 3,
    faceChangeCount: 6,
    productionChangeCount: 4,
    avgFaceChangeTime: 7.2,
    avgProductionChangeTime: 26.8,
    keyTimeMetrics: { runningTime: 535, plannedDowntime: 102, unplannedDowntime: 83 },
    downtimeAnalysis: [
      { name: '故障', value: 30, color: '#ff4d6a' },
      { name: '人员响应损失', value: 24, color: '#ff6b9d' },
      { name: '未知停机', value: 29, color: '#8ba4c7' },
    ],
  },
  '2026-06-06': {
    equipmentStatus: 'fault',
    availabilityRate: 81.2,
    personnelLossDuration: 38,
    personnelLossCount: 6,
    faceChangeCount: 9,
    productionChangeCount: 2,
    avgFaceChangeTime: 9.6,
    avgProductionChangeTime: 35.6,
    keyTimeMetrics: { runningTime: 468, plannedDowntime: 128, unplannedDowntime: 124 },
    downtimeAnalysis: [
      { name: '故障', value: 58, color: '#ff4d6a' },
      { name: '人员响应损失', value: 40, color: '#ff6b9d' },
      { name: '未知停机', value: 26, color: '#8ba4c7' },
    ],
  },
  '2026-06-05': {
    equipmentStatus: 'running',
    availabilityRate: 78.3,
    personnelLossDuration: 42,
    personnelLossCount: 6,
    faceChangeCount: 10,
    productionChangeCount: 3,
    avgFaceChangeTime: 7.8,
    avgProductionChangeTime: 28.2,
    keyTimeMetrics: { runningTime: 452, plannedDowntime: 138, unplannedDowntime: 130 },
    downtimeAnalysis: [
      { name: '故障', value: 62, color: '#ff4d6a' },
      { name: '人员响应损失', value: 44, color: '#ff6b9d' },
      { name: '未知停机', value: 24, color: '#8ba4c7' },
    ],
  },
  '2026-06-04': {
    equipmentStatus: 'stopped',
    availabilityRate: 72.5,
    personnelLossDuration: 48,
    personnelLossCount: 7,
    faceChangeCount: 11,
    productionChangeCount: 4,
    avgFaceChangeTime: 10.2,
    avgProductionChangeTime: 38.5,
    keyTimeMetrics: { runningTime: 420, plannedDowntime: 145, unplannedDowntime: 155 },
    downtimeAnalysis: [
      { name: '故障', value: 70, color: '#ff4d6a' },
      { name: '人员响应损失', value: 48, color: '#ff6b9d' },
      { name: '未知停机', value: 37, color: '#8ba4c7' },
    ],
  },
}

export function getDashboardDataByDate(date: string): OeeMetrics {
  const override = DAY_OVERRIDES[date] ?? DAY_OVERRIDES[DEFAULT_DASHBOARD_DATE]

  return {
    ...oeeDashboardData,
    ...override,
    faultDowntime: override.downtimeAnalysis[0].value,
  }
}
