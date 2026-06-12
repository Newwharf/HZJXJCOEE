<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { TimelineDetailItem } from '@/utils/productionTimeline'
import {
  CAMERA_LABELS,
  CAMERA_VIDEO_SOURCES,
  type CameraType,
} from '@/constants/eventVideo'
import { getEventPlaybackRange } from '@/utils/eventVideo'
import { formatDuration } from '@/utils/time'

const props = defineProps<{
  visible: boolean
  event?: TimelineDetailItem | null
  initialCamera?: CameraType
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const activeCamera = ref<CameraType>('inner')
const videoRef = ref<HTMLVideoElement | null>(null)

const playbackRange = computed(() => {
  if (!props.event) return null
  return getEventPlaybackRange(props.event.start, props.event.end)
})

const modalTitle = computed(() =>
  props.event?.label ?? `${CAMERA_LABELS[activeCamera.value]}画面`,
)

const modalSubtitle = computed(() => {
  if (!props.event || !playbackRange.value) {
    return `${CAMERA_LABELS[activeCamera.value]} · 实时画面回放`
  }
  return `${props.event.subTypeLabel} · 回放时段 ${playbackRange.value.playbackStart} — ${playbackRange.value.playbackEnd}（事件前后 30 秒，共 ${formatDuration(Math.ceil(playbackRange.value.playbackDurationSeconds / 60))}）`
})

const videoSrc = computed(() => CAMERA_VIDEO_SOURCES[activeCamera.value])

function closeModal() {
  videoRef.value?.pause()
  emit('update:visible', false)
}

async function switchCamera(camera: CameraType) {
  if (activeCamera.value === camera) return
  activeCamera.value = camera
  await nextTick()
  void videoRef.value?.play()
}

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) {
      videoRef.value?.pause()
      return
    }

    activeCamera.value = props.initialCamera ?? 'inner'
    await nextTick()
    void videoRef.value?.play()
  },
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="event-video-modal"
      @click.self="closeModal"
    >
      <div class="event-video-modal__panel">
        <header class="event-video-modal__header">
          <div class="event-video-modal__title-wrap">
            <h3 class="event-video-modal__title">{{ modalTitle }}</h3>
            <p class="event-video-modal__subtitle">{{ modalSubtitle }}</p>
          </div>
          <button
            type="button"
            class="event-video-modal__close"
            aria-label="关闭"
            @click="closeModal"
          >
            ×
          </button>
        </header>

        <div class="event-video-modal__camera-switch">
          <button
            v-for="camera in (['inner', 'outer'] as CameraType[])"
            :key="camera"
            type="button"
            class="event-video-modal__camera-btn"
            :class="{ 'event-video-modal__camera-btn--active': activeCamera === camera }"
            @click="switchCamera(camera)"
          >
            {{ CAMERA_LABELS[camera] }}
          </button>
        </div>

        <div class="event-video-modal__player">
          <video
            :key="activeCamera"
            ref="videoRef"
            class="event-video-modal__video"
            :src="videoSrc"
            controls
            playsinline
          />
        </div>

        <footer class="event-video-modal__footer">
          <span v-if="event">
            事件时段 {{ event.start }} — {{ event.end }}
          </span>
          <span v-else>机床监控画面</span>
          <span>当前机位 {{ CAMERA_LABELS[activeCamera] }}</span>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.event-video-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(2, 10, 22, 0.72);
  backdrop-filter: blur(4px);
}

.event-video-modal__panel {
  width: min(760px, 100%);
  background: linear-gradient(180deg, rgba(8, 28, 56, 0.98) 0%, rgba(6, 22, 44, 0.98) 100%);
  border: 1px solid rgba(0, 212, 255, 0.35);
  border-radius: 8px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.event-video-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.12);
}

.event-video-modal__title-wrap {
  min-width: 0;
}

.event-video-modal__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #e8f4ff;
}

.event-video-modal__subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(232, 244, 255, 0.55);
}

.event-video-modal__close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;
  background: rgba(0, 40, 80, 0.35);
  color: rgba(232, 244, 255, 0.75);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: rgba(0, 212, 255, 0.45);
    color: #fff;
  }
}

.event-video-modal__camera-switch {
  display: flex;
  gap: 8px;
  padding: 10px 16px 0;
}

.event-video-modal__camera-btn {
  padding: 6px 14px;
  border: 1px solid rgba(0, 212, 255, 0.18);
  border-radius: 4px;
  background: rgba(0, 40, 80, 0.35);
  color: rgba(232, 244, 255, 0.65);
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;

  &:hover {
    border-color: rgba(0, 212, 255, 0.35);
    color: rgba(232, 244, 255, 0.9);
  }

  &--active {
    border-color: rgba(0, 212, 255, 0.55);
    background: rgba(0, 80, 140, 0.45);
    color: #e8f4ff;
    box-shadow: inset 0 0 10px rgba(0, 102, 255, 0.15);
  }
}

.event-video-modal__player {
  padding: 12px 16px;
}

.event-video-modal__video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 4px;
  background: #000;
  border: 1px solid rgba(0, 212, 255, 0.12);
}

.event-video-modal__footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px 14px;
  font-size: 11px;
  color: rgba(232, 244, 255, 0.45);
}
</style>
