<script setup lang="ts">
import { computed } from 'vue'
import V3Panel from './V3Panel.vue'

const props = defineProps<{
  rate: number
  dayChange?: number
}>()

const uid = `avail-${Math.random().toString(36).slice(2, 8)}`

const displayRate = computed(() => props.rate.toFixed(1))
const trendUp = computed(() => (props.dayChange ?? 0) >= 0)
const changeText = computed(() => {
  if (props.dayChange == null) return null
  const sign = props.dayChange >= 0 ? '+' : ''
  return `${sign}${props.dayChange.toFixed(1)}%`
})

const fillPercent = computed(() => Math.min(Math.max(props.rate, 0), 100))

const WAVE_BODY =
  'M0,38 Q100,24 200,38 T400,38 L400,200 L0,200 Z'
const WAVE_BODY_BACK =
  'M0,42 Q100,30 200,42 T400,42 L400,200 L0,200 Z'
const WAVE_CREST = 'M0,38 Q100,24 200,38 T400,38'
</script>

<template>
  <V3Panel title="可用率" :header-border="false" class="availability-card">
    <div class="availability-card__body">
      <div
        class="availability-card__liquid"
        :style="{ '--fill-height': `${fillPercent}%` }"
        aria-hidden="true"
      >
        <div class="availability-card__wave-layer availability-card__wave-layer--back">
          <svg
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            class="availability-card__wave-svg availability-card__wave-svg--back"
          >
            <defs>
              <linearGradient :id="`${uid}-body-back`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--v3-water-back-top)" stop-opacity="0.55" />
                <stop offset="35%" stop-color="var(--v3-water-back-mid)" stop-opacity="0.42" />
                <stop offset="100%" stop-color="var(--v3-water-back-bottom)" stop-opacity="0.85" />
              </linearGradient>
            </defs>
            <path :d="WAVE_BODY_BACK" :fill="`url(#${uid}-body-back)`" />
            <path :d="WAVE_BODY_BACK" :fill="`url(#${uid}-body-back)`" transform="translate(400, 0)" />
          </svg>
        </div>

        <div class="availability-card__wave-layer availability-card__wave-layer--front">
          <svg
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            class="availability-card__wave-svg availability-card__wave-svg--front"
          >
            <defs>
              <linearGradient :id="`${uid}-body-front`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--v3-water-front-top)" stop-opacity="0.78" />
                <stop offset="20%" stop-color="var(--v3-water-front-mid)" stop-opacity="0.55" />
                <stop offset="100%" stop-color="var(--v3-water-front-bottom)" stop-opacity="0.72" />
              </linearGradient>
              <linearGradient :id="`${uid}-crest`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--v3-water-crest-top)" stop-opacity="0.95" />
                <stop offset="100%" stop-color="var(--v3-water-crest-bottom)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="WAVE_BODY" :fill="`url(#${uid}-body-front)`" />
            <path :d="WAVE_BODY" :fill="`url(#${uid}-body-front)`" transform="translate(400, 0)" />
            <path
              :d="WAVE_CREST"
              fill="none"
              :stroke="`url(#${uid}-crest)`"
              stroke-width="2"
              stroke-linecap="round"
              opacity="0.9"
            />
            <path
              :d="WAVE_CREST"
              fill="none"
              :stroke="`url(#${uid}-crest)`"
              stroke-width="2"
              stroke-linecap="round"
              opacity="0.9"
              transform="translate(400, 0)"
            />
          </svg>
        </div>

        <div class="availability-card__bubbles">
          <span
            v-for="(b, i) in [
              { left: '18%', size: 5, delay: 0 },
              { left: '42%', size: 4, delay: 1.1 },
              { left: '68%', size: 6, delay: 0.5 },
              { left: '82%', size: 3, delay: 2.0 },
            ]"
            :key="i"
            class="availability-card__bubble"
            :style="{
              left: b.left,
              width: `${b.size}px`,
              height: `${b.size}px`,
              animationDelay: `${b.delay}s`,
            }"
          />
        </div>

        <div class="availability-card__metrics">
          <div class="availability-card__value">
            {{ displayRate }}<span class="availability-card__unit">%</span>
          </div>
          <div v-if="changeText != null" class="availability-card__trend">
            <span class="availability-card__trend-label">较昨日</span>
            <span class="availability-card__trend-value" :class="{ 'is-up': trendUp }">
              {{ changeText }}
              <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path v-if="trendUp" d="M5 1.5L8.5 7H1.5z" fill="currentColor" />
                <path v-else d="M5 8.5L1.5 3h7z" fill="currentColor" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  </V3Panel>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v3/variables' as *;

$card-bg: $v3-bg-card;
$water-accent: var(--v3-water-front-top);

.availability-card {
  background: $card-bg;

  :deep(.v3-panel__header) {
    padding: 14px 16px 8px;
    background: $card-bg;
  }

  :deep(.v3-panel__body) {
    padding: 0;
    overflow: hidden;
    background: $card-bg;
  }
}

.availability-card__body {
  position: relative;
  flex: 1;
  min-height: 0;
  height: 100%;
}

.availability-card__liquid {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--fill-height);
  overflow: hidden;
  transition: height 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.availability-card__metrics {
  position: absolute;
  z-index: 4;
  bottom: 12px;
  left: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  max-width: calc(100% - 32px);
}

.availability-card__value {
  display: flex;
  align-items: baseline;
  flex-shrink: 0;
  font-size: 40px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: $v3-text-bright;
  letter-spacing: -0.03em;
}

.availability-card__wave-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;

  &--back {
    z-index: 1;
  }

  &--front {
    z-index: 2;
  }
}

.availability-card__wave-svg {
  width: 200%;
  height: 100%;
  will-change: transform;
  shape-rendering: geometricPrecision;

  &--back {
    animation: wave-drift 14s linear infinite;
  }

  &--front {
    animation: wave-drift 10s linear infinite reverse;
  }
}

@keyframes wave-drift {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

.availability-card__bubbles {
  position: absolute;
  inset: 0;
  z-index: 3;
}

.availability-card__bubble {
  position: absolute;
  bottom: 18%;
  border-radius: 50%;
  background: $v3-water-bubble;
  border: 1px solid $v3-water-bubble-alt;
  opacity: 0;
  animation: bubble-rise 5s ease-in-out infinite;
}

@keyframes bubble-rise {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.8);
  }

  25% {
    opacity: 0.6;
  }

  100% {
    opacity: 0;
    transform: translateY(-40px) scale(1.05);
  }
}

.availability-card__unit {
  font-size: 24px;
  font-weight: 600;
  margin-left: 2px;
  color: $v3-water-text-strong;
}

.availability-card__trend {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
}

.availability-card__trend-label {
  color: $v3-water-text-muted;
}

.availability-card__trend-value {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: $v3-water-text-subtle;

  svg {
    width: 9px;
    height: 9px;
  }

  &.is-up {
    color: $water-accent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .availability-card__liquid {
    transition: none;
  }

  .availability-card__wave-svg,
  .availability-card__bubble {
    animation: none;
  }
}
</style>
