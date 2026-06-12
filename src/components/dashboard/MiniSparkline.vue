<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    data: number[]
    color?: string
    delay?: number
  }>(),
  {
    color: '#00d4ff',
    delay: 0,
  },
)

const lineRef = ref<SVGPathElement | null>(null)
const pathLength = ref(0)

const width = 120
const height = 32
const padding = 4

const gradientId = computed(() => `spark-${props.color.replace('#', '')}`)

const coords = computed(() => {
  const { data } = props
  if (!data.length) return []

  const min = Math.min(...data)
  const max = Math.max(...data)
  const mid = (min + max) / 2
  const halfRange = Math.max((max - min) / 2, (max - min || 1) * 0.55, 1)
  const paddedMin = mid - halfRange
  const paddedMax = mid + halfRange
  const range = paddedMax - paddedMin
  const stepX = (width - padding * 2) / (data.length - 1 || 1)

  return data.map((val, i) => ({
    x: padding + i * stepX,
    y: padding + (height - padding * 2) * (1 - (val - paddedMin) / range),
  }))
})

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  if (points.length === 2) {
    return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`
  }

  let path = `M${points[0].x},${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, points.length - 1)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }

  return path
}

const linePath = computed(() => buildSmoothPath(coords.value))

const areaPath = computed(() => {
  if (!coords.value.length) return ''

  const baseY = height - padding
  const first = coords.value[0]
  const last = coords.value[coords.value.length - 1]
  const curvePart = buildSmoothPath(coords.value).replace(/^M[\d.]+,[\d.]+ ?/, '')

  return `M${first.x},${baseY} L${first.x},${first.y} ${curvePart} L${last.x},${baseY} Z`
})

const lastPoint = computed(() => coords.value[coords.value.length - 1] ?? null)

const chartStyle = computed(() => ({
  '--path-length': String(pathLength.value),
  '--anim-delay': `${props.delay}ms`,
}))

async function measurePath() {
  await nextTick()
  pathLength.value = lineRef.value?.getTotalLength() ?? 0
}

onMounted(measurePath)
watch(linePath, measurePath)
</script>

<template>
  <svg
    class="mini-sparkline"
    :style="chartStyle"
    :viewBox="`0 0 ${width} ${height}`"
    preserveAspectRatio="none"
    overflow="hidden"
  >
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.45" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
      <filter :id="`${gradientId}-glow`" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <path
      v-if="areaPath"
      class="mini-sparkline__area"
      :d="areaPath"
      :fill="`url(#${gradientId})`"
    />
    <path
      v-if="linePath"
      ref="lineRef"
      class="mini-sparkline__line"
      :d="linePath"
      fill="none"
      :stroke="color"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :filter="`url(#${gradientId}-glow)`"
    />
    <circle
      v-if="lastPoint"
      class="mini-sparkline__dot"
      :cx="lastPoint.x"
      :cy="lastPoint.y"
      r="2.5"
      :fill="color"
    />
  </svg>
</template>

<style scoped lang="scss">
.mini-sparkline {
  display: block;
  width: 100%;
  height: 100%;
  max-height: 32px;
}

.mini-sparkline__area {
  opacity: 0;
  clip-path: inset(0 100% 0 0);
  animation: sparkline-area-enter 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(var(--anim-delay) + 0.1s);
}

.mini-sparkline__line {
  stroke-dasharray: var(--path-length);
  stroke-dashoffset: var(--path-length);
  opacity: 0.4;
  animation:
    sparkline-line-enter 0.85s cubic-bezier(0.4, 0, 0.2, 1) forwards,
    sparkline-line-glow 0.85s ease forwards;
  animation-delay: var(--anim-delay), var(--anim-delay);
}

.mini-sparkline__dot {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(0);
  animation: sparkline-dot-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: calc(var(--anim-delay) + 0.72s);
}

@keyframes sparkline-line-enter {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes sparkline-line-glow {
  to {
    opacity: 1;
  }
}

@keyframes sparkline-area-enter {
  0% {
    opacity: 0;
    clip-path: inset(0 100% 0 0);
  }

  40% {
    opacity: 0.6;
  }

  to {
    opacity: 1;
    clip-path: inset(0 0 0 0);
  }
}

@keyframes sparkline-dot-enter {
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
