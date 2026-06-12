import type { TimelineEventType } from '@/types/oee'

export const TIMELINE_COLORS: Record<TimelineEventType, string> = {
  production: '#00e5a0',
  face_change: '#ffaa00',
  production_change: '#7b61ff',
  fault: '#ff4d6a',
  personnel_loss: '#ff6b9d',
  face_change_op: '#ffd666',
  unknown_downtime: '#8ba4c7',
}

export const TIMELINE_LABELS: Record<TimelineEventType, string> = {
  production: '生产中',
  face_change: '换面中',
  production_change: '换产',
  fault: '故障',
  personnel_loss: '人员响应损失',
  face_change_op: '换面操作',
  unknown_downtime: '未知停机',
}

export const EQUIPMENT_STATUS_MAP = {
  running: { label: '运行中', color: '#00e5a0' },
  stopped: { label: '停机中', color: '#8ba4c7' },
  fault: { label: '故障中', color: '#ff4d6a' },
} as const
