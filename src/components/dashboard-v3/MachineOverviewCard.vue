<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import V3Panel from './V3Panel.vue'
import EventVideoModal from '@/components/dashboard/EventVideoModal.vue'
import type { CameraType } from '@/constants/eventVideo'
import { CAMERA_LABELS } from '@/constants/eventVideo'
import type { EquipmentStatus, KeyTimeMetrics } from '@/types/oee'
import machineImage from '@/assets/machineTools.png'
import cameraInnerBg from '@/assets/in.png'
import cameraOuterBg from '@/assets/out.png'

const props = defineProps<{
  status: EquipmentStatus
  statusDuration?: number
  keyTimeMetrics: KeyTimeMetrics
}>()

const DAY_MINUTES = 24 * 60

const STATUS_MAP = {
  running: { label: '负载运行', color: 'var(--v3-status-running)' },
  stopped: { label: '停机', color: 'var(--v3-status-stopped)' },
  fault: { label: '故障', color: 'var(--v3-danger)' },
} as const

function formatCompactDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const footerMetrics = computed(() => {
  const pct = (val: number) => ((val / DAY_MINUTES) * 100).toFixed(1)

  return [
    {
      icon: 'gear',
      label: '今日负载运行时间',
      value: formatCompactDuration(props.keyTimeMetrics.runningTime),
      percent: pct(props.keyTimeMetrics.runningTime),
      color: 'var(--v3-status-running)',
      bg: 'var(--v3-status-running-bg)',
    },
    {
      icon: 'clock',
      label: '今日正常停机时间',
      value: formatCompactDuration(props.keyTimeMetrics.plannedDowntime),
      percent: pct(props.keyTimeMetrics.plannedDowntime),
      color: 'var(--v3-status-planned)',
      bg: 'var(--v3-status-planned-bg)',
    },
    {
      icon: 'warning',
      label: '今日非正常停机时间',
      value: formatCompactDuration(props.keyTimeMetrics.unplannedDowntime),
      percent: pct(props.keyTimeMetrics.unplannedDowntime),
      color: 'var(--v3-danger)',
      bg: 'var(--v3-danger-dim)',
    },
  ]
})

const DISPLAY_CYCLE: EquipmentStatus[] = ['running', 'stopped']

const displayStatus = ref<EquipmentStatus>(props.status)

const statusInfo = computed(() => STATUS_MAP[displayStatus.value])

function cycleDisplayStatus() {
  const idx = DISPLAY_CYCLE.indexOf(displayStatus.value)
  const next = DISPLAY_CYCLE[(idx + 1) % DISPLAY_CYCLE.length] ?? DISPLAY_CYCLE[0]
  displayStatus.value = next
  elapsedSeconds.value = 0
}

const elapsedSeconds = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const elapsedParts = computed(() => {
  const base = props.statusDuration != null ? props.statusDuration * 60 + 12 : 9252
  const total = base + elapsedSeconds.value
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    h: pad(Math.floor(total / 3600)),
    m: pad(Math.floor((total % 3600) / 60)),
    s: pad(total % 60),
  }
})

const cameras = [
  { type: 'inner' as const, bg: cameraInnerBg },
  { type: 'outer' as const, bg: cameraOuterBg },
]

const videoModalVisible = ref(false)
const videoInitialCamera = ref<CameraType>('inner')

function openCamera(camera: CameraType) {
  videoInitialCamera.value = camera
  videoModalVisible.value = true
}

onMounted(() => {
  timer = setInterval(() => {
    elapsedSeconds.value += 1
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <V3Panel title="机床运行概览" class="machine-overview">
    <div class="machine-overview__main">
      <div class="machine-overview__image-wrap">
        <img
          :src="machineImage"
          alt="DMU 50 五轴加工中心"
          class="machine-overview__image"
          draggable="false"
        />
      </div>

      <div class="machine-overview__divider" aria-hidden="true" />

      <div class="machine-overview__status">
        <button
          type="button"
          class="machine-overview__status-block machine-overview__status-block--interactive"
          :aria-label="`当前状态：${statusInfo.label}，点击切换`"
          @click="cycleDisplayStatus"
        >
          <span class="machine-overview__status-label">当前状态</span>
          <div class="machine-overview__status-value" :style="{ color: statusInfo.color }">
            {{ statusInfo.label }}
            <svg
              v-if="displayStatus === 'running'"
              class="machine-overview__ecg"
              viewBox="0 0 56 18"
              fill="none"
              aria-hidden="true"
            >
              <g class="machine-overview__ecg-track">
                <path
                  class="machine-overview__ecg-path"
                  d="M0 9h4l1.2 0 .8-.2 1-6.5 1 13 1-8.5 1 3.2h4.5l1-2.8 1 5.2 1-3.5 1 1.8H28"
                  :stroke="statusInfo.color"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  class="machine-overview__ecg-path"
                  transform="translate(28 0)"
                  d="M0 9h4l1.2 0 .8-.2 1-6.5 1 13 1-8.5 1 3.2h4.5l1-2.8 1 5.2 1-3.5 1 1.8H28"
                  :stroke="statusInfo.color"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
            </svg>
            <svg
              v-else
              class="machine-overview__flatline"
              viewBox="0 0 56 18"
              fill="none"
              aria-hidden="true"
            >
              <line
                class="machine-overview__flatline-path"
                x1="0"
                y1="9"
                x2="56"
                y2="9"
                :stroke="statusInfo.color"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <circle
                class="machine-overview__flatline-dot"
                cx="0"
                cy="9"
                r="2"
                :fill="statusInfo.color"
              />
            </svg>
          </div>
        </button>

        <div class="machine-overview__status-block">
          <span class="machine-overview__status-label">持续时间</span>
          <div class="machine-overview__duration" aria-live="polite">
            <span class="machine-overview__duration-segment">
              <span class="machine-overview__duration-num">{{ elapsedParts.h }}</span>
              <span class="machine-overview__duration-unit">h</span>
            </span>
            <span class="machine-overview__duration-segment">
              <span class="machine-overview__duration-num">{{ elapsedParts.m }}</span>
              <span class="machine-overview__duration-unit">m</span>
            </span>
            <span class="machine-overview__duration-segment">
              <span class="machine-overview__duration-num">{{ elapsedParts.s }}</span>
              <span class="machine-overview__duration-unit">s</span>
            </span>
          </div>
        </div>
      </div>

      <div class="machine-overview__cameras">
        <button
          v-for="camera in cameras"
          :key="camera.type"
          type="button"
          class="machine-overview__camera"
          @click="openCamera(camera.type)"
        >
          <div
            class="machine-overview__camera-thumb"
            :style="{ backgroundImage: `url(${camera.bg})` }"
          >
            <span class="machine-overview__camera-label">{{ CAMERA_LABELS[camera.type] }}</span>
            <span class="machine-overview__camera-dot" aria-hidden="true" />
            <span class="machine-overview__camera-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.92)" />
                <path d="M10 8l6 4-6 4z" fill="#1a1a1a" />
              </svg>
            </span>
          </div>
        </button>
      </div>
    </div>

    <div class="machine-overview__footer">
      <div
        v-for="item in footerMetrics"
        :key="item.label"
        class="machine-overview__stat"
      >
        <div
          class="machine-overview__stat-icon"
          :style="{ color: item.color, background: item.bg }"
        >
          <svg v-if="item.icon === 'gear'" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M10 3.5l.8 2.2 2.3.3-1.7 1.5.5 2.3-2-1.2-2 1.2.5-2.3-1.7-1.5 2.3-.3L10 3.5z"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linejoin="round"
            />
            <path
              d="M4 11.5c.3 1.2 1 2.2 2 2.9M16 11.5c-.3 1.2-1 2.2-2 2.9M7 16.5c1 .5 2.1.7 3 .7s2-.2 3-.7M7 5.5c1-.5 2.1-.7 3-.7s2 .2 3 .7"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
            />
          </svg>
          <svg v-else-if="item.icon === 'clock'" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.3" />
            <path d="M10 6v4l3 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          </svg>
          <svg v-else viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M10 4.5l6.5 11H3.5L10 4.5z"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linejoin="round"
            />
            <path d="M10 9v3.5M10 14.2h.01" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          </svg>
        </div>
        <div class="machine-overview__stat-info">
          <span class="machine-overview__stat-label">{{ item.label }}</span>
          <div class="machine-overview__stat-value-row">
            <span class="machine-overview__stat-value">{{ item.value }}</span>
            <span class="machine-overview__stat-pct">占比 {{ item.percent }}%</span>
          </div>
        </div>
      </div>
    </div>

    <EventVideoModal
      v-model:visible="videoModalVisible"
      :initial-camera="videoInitialCamera"
      variant="v3"
    />
  </V3Panel>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v3/variables' as *;

$machine-camera-entry-height: 104px;
$machine-camera-stack-height: $machine-camera-entry-height * 2 + $v3-space-sm;

.machine-overview {
  :deep(.v3-panel__header) {
    padding: 10px $v3-space-sm 8px;
  }

  :deep(.v3-panel__body) {
    --overview-stat-col: calc((100% - #{$v3-space-md * 2}) / 3);
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    gap: $v3-space-sm;
    padding: $v3-space-sm $v3-space-sm $v3-space-sm;
  }
}

.machine-overview__main {
  flex: 0 0 auto;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  min-height: 0;
  width: 100%;
}

.machine-overview__image-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: $machine-camera-stack-height;
  flex: 0 1 auto;
  min-width: 0;
}

.machine-overview__image {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: left center;
  filter: drop-shadow(0 10px 28px rgba(0, 0, 0, 0.45));
}

.machine-overview__divider {
  flex: 0 0 1px;
  width: 1px;
  height: $machine-camera-stack-height;
  background: rgba(148, 163, 184, 0.28);
  align-self: center;
}

.machine-overview__status {
  display: flex;
  flex-direction: column;
  gap: $v3-space-sm;
  flex: 0 0 248px;
  width: 248px;
  min-width: 248px;
  height: $machine-camera-stack-height;
  justify-content: flex-start;
  box-sizing: border-box;
}

.machine-overview__status-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: $machine-camera-entry-height;
  justify-content: flex-start;

  &--interactive {
    width: 100%;
    padding: 0;
    margin: 0;
    background: none;
    border: 1px solid transparent;
    border-radius: $v3-radius-sm;
    cursor: pointer;
    text-align: left;
    transition:
      background $v3-transition,
      border-color $v3-transition;

    &:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(148, 163, 184, 0.2);
    }

    &:focus-visible {
      outline: 1px solid rgba(74, 222, 128, 0.5);
      outline-offset: 2px;
    }
  }
}

.machine-overview__status-label {
  font-size: 15px;
  color: $v3-text-secondary;
}

.machine-overview__status-value {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
}

.machine-overview__ecg {
  width: 56px;
  height: 18px;
  flex-shrink: 0;
  overflow: hidden;
}

.machine-overview__ecg-path {
  filter: drop-shadow(0 0 3px currentColor);
}

.machine-overview__ecg-track {
  animation: ecg-scroll 1.6s linear infinite;
  will-change: transform;
}

@keyframes ecg-scroll {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-28px);
  }
}

.machine-overview__flatline {
  width: 56px;
  height: 18px;
  flex-shrink: 0;
  overflow: visible;
}

.machine-overview__flatline-path {
  filter: drop-shadow(0 0 3px currentColor);
  animation: flatline-pulse 2.4s ease-in-out infinite;
}

.machine-overview__flatline-dot {
  filter: drop-shadow(0 0 4px currentColor);
  animation: flatline-scan 3s linear infinite;
}

@keyframes flatline-pulse {
  0%,
  100% {
    opacity: 0.35;
  }

  50% {
    opacity: 1;
  }
}

@keyframes flatline-scan {
  from {
    transform: translateX(0);
    opacity: 0.2;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  to {
    transform: translateX(56px);
    opacity: 0.2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .machine-overview__ecg-track,
  .machine-overview__flatline-path,
  .machine-overview__flatline-dot {
    animation: none;
  }

  .machine-overview__flatline-path {
    opacity: 0.7;
  }
}

.machine-overview__duration {
  display: flex;
  align-items: baseline;
  width: 100%;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
  line-height: 1;
  color: $v3-text;
}

.machine-overview__duration-segment {
  display: inline-flex;
  align-items: baseline;
  flex: 0 0 72px;
  min-width: 72px;
}

.machine-overview__duration-num {
  display: inline-block;
  width: 2ch;
  min-width: 2ch;
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 0;
  text-align: center;
}

.machine-overview__duration-unit {
  margin-left: 5px;
  font-size: 18px;
  font-weight: 400;
  color: rgba(248, 250, 252, 0.55);
}

.machine-overview__cameras {
  display: flex;
  flex-direction: column;
  gap: $v3-space-sm;
  flex: 0 0 var(--overview-stat-col);
  width: var(--overview-stat-col);
  min-width: 0;
}

.machine-overview__camera {
  display: block;
  width: 100%;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;

  &:hover .machine-overview__camera-thumb {
    border-color: rgba(148, 163, 184, 0.55);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
  }

  &:focus-visible {
    outline: 1px solid rgba(74, 222, 128, 0.5);
    outline-offset: 2px;
    border-radius: $v3-radius-sm;
  }
}

.machine-overview__camera-thumb {
  position: relative;
  width: 100%;
  height: $machine-camera-entry-height;
  background-color: $v3-bg-elevated;
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04);
  border-radius: $v3-radius-md;
  overflow: hidden;
  transition: border-color $v3-transition, box-shadow $v3-transition;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.05) 45%, rgba(0, 0, 0, 0.2) 100%);
    pointer-events: none;
  }
}

.machine-overview__camera-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.8);
}

.machine-overview__camera-play {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 1;
  width: 28px;
  height: 28px;

  svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
  }
}

.machine-overview__camera-label {
  position: absolute;
  top: 8px;
  left: 10px;
  z-index: 1;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.machine-overview__footer {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  gap: $v3-space-md;
  padding: $v3-space-md $v3-space-lg;
  background: $v3-control-bg;
  border: 1px solid $v3-control-border;
  border-radius: $v3-radius-md;
}

.machine-overview__stat {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $v3-space-sm;
  min-width: 0;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: calc($v3-space-md / -2);
    top: 50%;
    width: 1px;
    height: 70%;
    background: $v3-divider;
    transform: translateY(-50%);
  }
}

.machine-overview__stat-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  svg {
    width: 18px;
    height: 18px;
  }
}

.machine-overview__stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.machine-overview__stat-label {
  font-size: 13px;
  color: $v3-text-secondary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.machine-overview__stat-value-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
}

.machine-overview__stat-value {
  font-size: 22px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: $v3-text;
  line-height: 1;
}

.machine-overview__stat-pct {
  font-size: 12px;
  color: $v3-text-secondary;
}
</style>
