<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import EventVideoModal from '@/components/dashboard/EventVideoModal.vue'
import type { CameraType } from '@/constants/eventVideo'
import { CAMERA_LABELS } from '@/constants/eventVideo'
import {
  V2_MACHINE_METRICS,
  V2_MACHINE_STATUS,
} from '@/constants/dashboardV2ChartTheme'
import type { EquipmentStatus, KeyTimeMetrics } from '@/types/oee'
import { formatDuration } from '@/utils/time'
import cncImage from '@/assets/cnc.png'

const props = withDefaults(
  defineProps<{
    status: EquipmentStatus
    statusNote?: string
    statusDuration?: number
    statusDurations?: Partial<Record<EquipmentStatus, number>>
    keyTimeMetrics: KeyTimeMetrics
    selectedDate: string
    minDate: string
    maxDate: string
    variant?: 'default' | 'muted'
    statusInteractive?: boolean
  }>(),
  { variant: 'default', statusInteractive: false },
)

const emit = defineEmits<{
  'update:selectedDate': [value: string]
}>()

const STATUS_MAP = {
  running: { label: '运行中', color: '#00e5a0' },
  stopped: { label: '停机', color: '#8ba4c7' },
  fault: { label: '故障', color: '#ff4d6a' },
} as const

const metricItems = [
  { key: 'runningTime' as const, label: '负载运行时间', color: '#00e5a0' },
  { key: 'plannedDowntime' as const, label: '计划内停机时间', color: '#ffaa00' },
  { key: 'unplannedDowntime' as const, label: '计划外停机时间', color: '#ff4d6a' },
]

const STATUS_CYCLE: EquipmentStatus[] = ['running', 'stopped', 'fault']

const interactiveStatus = ref<EquipmentStatus | null>(null)

const displayStatus = computed(() =>
  props.statusInteractive && interactiveStatus.value != null
    ? interactiveStatus.value
    : props.status,
)

const displayStatusNote = computed(() =>
  displayStatus.value === 'stopped' ? props.statusNote : undefined,
)

const displayStatusDuration = computed(() => {
  const fromMap = props.statusDurations?.[displayStatus.value]
  if (fromMap != null) return fromMap
  if (displayStatus.value === props.status && props.statusDuration != null) {
    return props.statusDuration
  }
  return undefined
})

const isMuted = computed(() => props.variant === 'muted')

const statusInfo = computed(() =>
  isMuted.value
    ? V2_MACHINE_STATUS[displayStatus.value]
    : STATUS_MAP[displayStatus.value],
)

const displayMetricItems = computed(() =>
  isMuted.value ? V2_MACHINE_METRICS : metricItems,
)

const videoModalVisible = ref(false)
const videoInitialCamera = ref<CameraType>('inner')

const cameraAnchors = {
  inner: { x: 10, y: 10 },
  outer: { x: 90, y: 22 },
  machineInner: { x: 36, y: 35 },
  machineOuter: { x: 64, y: 42 },
} as const

function onDateChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (value) emit('update:selectedDate', value)
}

function openCamera(camera: CameraType) {
  videoInitialCamera.value = camera
  videoModalVisible.value = true
}

function cycleStatus() {
  if (!props.statusInteractive) return
  const current = displayStatus.value
  const index = STATUS_CYCLE.indexOf(current)
  interactiveStatus.value = STATUS_CYCLE[(index + 1) % STATUS_CYCLE.length]
}

function onStatusKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    cycleStatus()
  }
}

watch(
  () => [props.status, props.selectedDate] as const,
  () => {
    interactiveStatus.value = null
  },
)
</script>

<template>
  <div
    class="machine-model"
    :class="[
      `machine-model--${displayStatus}`,
      { 'machine-model--muted': isMuted },
    ]"
  >
    <div class="machine-model__visual">
      <aside class="machine-model__side machine-model__side--left">
        <label class="machine-model__date">
          <span class="machine-model__date-label">统计时间</span>
          <input
            class="machine-model__date-input"
            type="date"
            :value="selectedDate"
            :min="minDate"
            :max="maxDate"
            @change="onDateChange"
          />
        </label>

        <div
          class="machine-model__status"
          :class="{ 'machine-model__status--interactive': statusInteractive }"
          :style="{ '--status-color': statusInfo.color }"
          :role="statusInteractive ? 'button' : undefined"
          :tabindex="statusInteractive ? 0 : undefined"
          :aria-label="[
            `设备状态 ${statusInfo.label}`,
            displayStatusNote,
            displayStatusDuration != null
              ? `持续 ${formatDuration(displayStatusDuration)}`
              : '',
            statusInteractive ? '点击切换状态' : '',
          ].filter(Boolean).join('，')"
          @click="cycleStatus"
          @keydown="onStatusKeydown"
        >
          <span class="machine-model__status-dot" aria-hidden="true" />
          <div class="machine-model__status-text">
            <span class="machine-model__status-value">{{ statusInfo.label }}</span>
            <p v-if="displayStatusNote" class="machine-model__status-note">
              {{ displayStatusNote }}
            </p>
            <p v-if="displayStatusDuration != null" class="machine-model__status-duration">
              持续 {{ formatDuration(displayStatusDuration) }}
            </p>
          </div>
        </div>
      </aside>

      <div class="machine-model__center">
        <svg
          class="machine-model__camera-lines"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            class="machine-model__line"
            :x1="cameraAnchors.machineInner.x"
            :y1="cameraAnchors.machineInner.y"
            :x2="cameraAnchors.inner.x"
            :y2="cameraAnchors.inner.y"
          />
          <line
            class="machine-model__line"
            :x1="cameraAnchors.machineOuter.x"
            :y1="cameraAnchors.machineOuter.y"
            :x2="cameraAnchors.outer.x"
            :y2="cameraAnchors.outer.y"
          />
        </svg>

        <button
          type="button"
          class="machine-model__camera machine-model__camera--inner"
          :style="{
            left: `${cameraAnchors.inner.x}%`,
            top: `${cameraAnchors.inner.y}%`,
          }"
          :aria-label="`播放${CAMERA_LABELS.inner}`"
          @click="openCamera('inner')"
        >
          <svg class="machine-model__camera-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 3h6v2H9z" fill="currentColor" />
            <path d="M11 5h2v2.5h-2z" fill="currentColor" />
            <path
              d="M3 10.5 9.5 8.5h9L21 10.5v5.5H3z"
              fill="currentColor"
            />
            <ellipse cx="12" cy="13" rx="3.2" ry="2.6" fill="rgba(10, 22, 40, 0.65)" />
            <circle cx="12" cy="13" r="1.4" fill="rgba(0, 212, 255, 0.75)" />
            <path
              d="M6.5 16h11l1.5 2H5z"
              fill="currentColor"
              opacity="0.85"
            />
          </svg>
        </button>

        <button
          type="button"
          class="machine-model__camera machine-model__camera--outer"
          :style="{
            left: `${cameraAnchors.outer.x}%`,
            top: `${cameraAnchors.outer.y}%`,
          }"
          :aria-label="`播放${CAMERA_LABELS.outer}`"
          @click="openCamera('outer')"
        >
          <svg class="machine-model__camera-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 3h6v2H9z" fill="currentColor" />
            <path d="M11 5h2v2.5h-2z" fill="currentColor" />
            <path
              d="M3 10.5 9.5 8.5h9L21 10.5v5.5H3z"
              fill="currentColor"
            />
            <ellipse cx="12" cy="13" rx="3.2" ry="2.6" fill="rgba(10, 22, 40, 0.65)" />
            <circle cx="12" cy="13" r="1.4" fill="rgba(0, 212, 255, 0.75)" />
            <path
              d="M6.5 16h11l1.5 2H5z"
              fill="currentColor"
              opacity="0.85"
            />
          </svg>
        </button>

        <div class="machine-model__glow" />
        <img
          class="machine-model__image"
          :src="cncImage"
          alt="五轴加工中心 CNC 机床"
          draggable="false"
        />
      </div>

      <aside class="machine-model__side machine-model__side--right">
        <div
          v-for="item in displayMetricItems"
          :key="item.key"
          class="machine-model__tag"
          :style="{ '--tag-color': item.color }"
        >
          <span class="machine-model__tag-label">{{ item.label }}</span>
          <span class="machine-model__tag-value">
            {{ formatDuration(keyTimeMetrics[item.key]) }}
          </span>
        </div>
      </aside>
    </div>

    <div class="machine-model__label">五轴加工中心 · CNC-7500</div>

    <EventVideoModal
      v-model:visible="videoModalVisible"
      :initial-camera="videoInitialCamera"
    />
  </div>
</template>

<style scoped lang="scss">
.machine-model {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.machine-model__visual {
  flex: 1;
  display: grid;
  grid-template-columns: 148px 1fr 118px;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 0;
  padding: 0 14px;
}

.machine-model__side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;

  &--left {
    align-self: center;
  }

  &--right {
    align-self: center;
    gap: 8px;
  }
}

.machine-model__date {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.machine-model__date-label {
  font-size: 11px;
  color: rgba(232, 244, 255, 0.45);
}

.machine-model__date-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid rgba(0, 212, 255, 0.22);
  border-radius: 4px;
  background: rgba(0, 30, 60, 0.55);
  color: #e8f4ff;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  cursor: pointer;

  &::-webkit-calendar-picker-indicator {
    filter: invert(0.75);
    cursor: pointer;
  }

  &:focus {
    border-color: rgba(0, 212, 255, 0.45);
  }
}

.machine-model__status {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(0, 30, 60, 0.45);
  border: 1px solid color-mix(in srgb, var(--status-color) 30%, transparent);
  border-radius: 4px;
  animation: status-panel-glow 2.6s ease-in-out infinite;

  &--interactive {
    cursor: pointer;
    user-select: none;
    transition: background 0.15s ease-out, border-color 0.15s ease-out;

    &:hover {
      background: rgba(0, 40, 75, 0.55);
    }

    &:focus-visible {
      outline: 1px solid color-mix(in srgb, var(--status-color) 60%, transparent);
      outline-offset: 2px;
    }
  }
}

.machine-model__status-dot {
  position: relative;
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  margin-top: 4px;
  border-radius: 50%;
  background: var(--status-color);
  box-shadow: 0 0 8px var(--status-color);
  animation: status-dot-glow 2s ease-in-out infinite;

  &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 1px solid var(--status-color);
    opacity: 0;
    animation: status-dot-ring 2s ease-out infinite;
  }
}

.machine-model__status-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.machine-model__status-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--status-color);
  line-height: 1.25;
  animation: status-text-glow 2.6s ease-in-out infinite;
}

.machine-model__status-note {
  margin: 0;
  font-size: 11px;
  line-height: 1.4;
  color: rgba(232, 244, 255, 0.55);
}

.machine-model__status-duration {
  margin: 0;
  font-size: 11px;
  line-height: 1.4;
  font-variant-numeric: tabular-nums;
  color: rgba(232, 244, 255, 0.45);
}

.machine-model__center {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: visible;
}

.machine-model__camera-lines {
  position: absolute;
  inset: 0;
  z-index: 3;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.machine-model__line {
  fill: none;
  stroke: rgba(0, 212, 255, 0.5);
  stroke-width: 0.35;
}

.machine-model__camera {
  position: absolute;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: none;
  transform: translate(-50%, -50%);
  cursor: pointer;
  color: #e8f4ff;

  .machine-model__camera-icon {
    width: 48px;
    height: 48px;
    padding: 8px;
    border-radius: 50%;
    background: rgba(0, 40, 80, 0.75);
    border: 1px solid rgba(0, 212, 255, 0.45);
    box-shadow: 0 0 14px rgba(0, 212, 255, 0.28);
    transition: background 0.15s, transform 0.15s;
    box-sizing: border-box;
    animation: camera-glow 2.2s ease-in-out infinite;
  }

  &--outer .machine-model__camera-icon {
    animation-delay: 1.1s;
  }

  &:hover .machine-model__camera-icon {
    background: rgba(0, 60, 110, 0.85);
    transform: scale(1.05);
    animation-play-state: paused;
  }
}

@keyframes camera-glow {
  0%, 100% {
    border-color: rgba(0, 212, 255, 0.35);
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.2);
  }

  50% {
    border-color: rgba(0, 212, 255, 0.9);
    box-shadow:
      0 0 18px rgba(0, 212, 255, 0.65),
      0 0 32px rgba(0, 212, 255, 0.28);
  }
}

@keyframes status-panel-glow {
  0%, 100% {
    box-shadow: 0 0 4px color-mix(in srgb, var(--status-color) 15%, transparent);
    border-color: color-mix(in srgb, var(--status-color) 28%, transparent);
  }

  50% {
    box-shadow: 0 0 16px color-mix(in srgb, var(--status-color) 50%, transparent);
    border-color: color-mix(in srgb, var(--status-color) 70%, transparent);
  }
}

@keyframes status-dot-glow {
  0%, 100% {
    box-shadow: 0 0 6px var(--status-color);
  }

  50% {
    box-shadow: 0 0 14px var(--status-color), 0 0 22px color-mix(in srgb, var(--status-color) 50%, transparent);
  }
}

@keyframes status-dot-ring {
  0% {
    transform: scale(0.8);
    opacity: 0.7;
  }

  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

@keyframes status-text-glow {
  0%, 100% {
    text-shadow: none;
    opacity: 0.85;
  }

  50% {
    text-shadow: 0 0 10px var(--status-color);
    opacity: 1;
  }
}

.machine-model__tag {
  padding: 6px 8px;
  background: rgba(0, 30, 60, 0.45);
  border: 1px solid color-mix(in srgb, var(--tag-color) 28%, transparent);
  border-left: 2px solid var(--tag-color);
  border-radius: 3px;
}

.machine-model__tag-label {
  display: block;
  font-size: 9px;
  color: rgba(232, 244, 255, 0.45);
  white-space: nowrap;
  margin-bottom: 2px;
}

.machine-model__tag-value {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--tag-color);
  font-variant-numeric: tabular-nums;
  line-height: 1.3;
  white-space: nowrap;
}

.machine-model__glow {
  position: absolute;
  width: 70%;
  height: 55%;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(0, 229, 160, 0.12) 0%, transparent 70%);
  transition: background 0.5s;
  pointer-events: none;
}

.machine-model--fault .machine-model__glow {
  background: radial-gradient(ellipse, rgba(255, 77, 106, 0.18) 0%, transparent 70%);
  animation: fault-glow 1.5s ease-in-out infinite;
}

.machine-model--stopped .machine-model__glow {
  background: radial-gradient(ellipse, rgba(139, 164, 199, 0.1) 0%, transparent 70%);
}

@keyframes fault-glow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.machine-model__image {
  position: relative;
  z-index: 1;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
  filter: drop-shadow(0 12px 32px rgba(0, 0, 0, 0.45));
}

.machine-model__label {
  flex-shrink: 0;
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(232, 244, 255, 0.5);
  letter-spacing: 2px;
}

.machine-model--muted {
  .machine-model__visual {
    grid-template-columns: 168px 1fr 118px;
  }

  .machine-model__status {
    animation: muted-status-breathe 2.8s ease-in-out infinite;
    border-color: #2d3a4f;
    background: #141a22;
    box-shadow: none;
    padding: 10px 12px;
    gap: 18px;
  }

  .machine-model__status-dot {
    margin-top: 5px;
    animation: muted-status-dot-pulse 2.4s ease-in-out infinite;
    box-shadow: none;

    &::after {
      display: block;
      border-color: var(--status-color);
      animation: muted-status-dot-ring 2.4s ease-out infinite;
    }
  }

  &.machine-model--stopped .machine-model__status-dot {
    background: #b87070;

    &::after {
      border-color: #b87070;
    }
  }

  .machine-model__status-text {
    gap: 4px;
  }

  .machine-model__status-value {
    animation: muted-status-value-breathe 2.8s ease-in-out infinite;
    color: #cbd5e1;
    font-size: 16px;
    font-weight: 600;
  }

  .machine-model__status-note {
    color: #94a3b8;
    font-size: 11px;
  }

  .machine-model__status-duration {
    color: #64748b;
    font-size: 10px;
  }

  .machine-model__tag {
    border: 1px solid color-mix(in srgb, var(--tag-color) 32%, #2d3a4f);
    background: color-mix(in srgb, var(--tag-color) 10%, #141a22);
  }

  .machine-model__tag-label {
    color: color-mix(in srgb, var(--tag-color) 50%, #64748b);
  }

  .machine-model__tag-value {
    color: var(--tag-color);
    font-weight: 500;
  }

  .machine-model__line {
    stroke: rgba(100, 116, 139, 0.35);
  }

  .machine-model__camera .machine-model__camera-icon {
    animation: muted-camera-breathe 2.6s ease-in-out infinite;
    background: rgba(20, 26, 34, 0.85);
    border-color: #3d4a58;
    box-shadow: none;
  }

  .machine-model__camera--outer .machine-model__camera-icon {
    animation-delay: 1.3s;
  }

  .machine-model__camera:hover .machine-model__camera-icon {
    animation-play-state: paused;
  }

  .machine-model__glow {
    display: none;
  }

  &.machine-model--fault .machine-model__glow {
    display: none;
    animation: none;
  }

  .machine-model__label {
    color: #64748b;
    letter-spacing: 1px;
    font-size: 13px;
  }

  @media (prefers-reduced-motion: reduce) {
    .machine-model__status,
    .machine-model__status-dot,
    .machine-model__status-dot::after,
    .machine-model__status-value,
    .machine-model__camera .machine-model__camera-icon {
      animation: none;
    }
  }
}

@keyframes muted-status-breathe {
  0%, 100% {
    border-color: #2d3a4f;
    background: #141a22;
  }

  50% {
    border-color: color-mix(in srgb, var(--status-color) 35%, #2d3a4f);
    background: #161d26;
  }
}

@keyframes muted-status-dot-pulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes muted-status-dot-ring {
  0% {
    transform: scale(0.9);
    opacity: 0.45;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes muted-status-value-breathe {
  0%, 100% {
    opacity: 0.86;
  }

  50% {
    opacity: 1;
  }
}

@keyframes muted-camera-breathe {
  0%, 100% {
    border-color: #3d4a58;
    background: rgba(20, 26, 34, 0.85);
    opacity: 0.86;
  }

  50% {
    border-color: #5a6d82;
    background: rgba(26, 34, 44, 0.92);
    opacity: 1;
  }
}
</style>
