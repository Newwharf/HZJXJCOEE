<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import DowntimeChart from './DowntimeChart.vue'
import type { DowntimeItem } from '@/types/oee'

const props = defineProps<{
  rate: number
  downtimeData: DowntimeItem[]
}>()

const RING_CIRCUMFERENCE = 125.7
const displayDash = ref(0)

function animateRing(targetRate: number) {
  const targetDash = targetRate * 1.257
  const start = performance.now()
  const duration = 1200

  function step(now: number) {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - (1 - progress) ** 3
    displayDash.value = targetDash * eased
    if (progress < 1) requestAnimationFrame(step)
  }

  displayDash.value = 0
  requestAnimationFrame(step)
}

onMounted(() => animateRing(props.rate))

watch(() => props.rate, (rate) => animateRing(rate))
</script>

<template>
  <section class="panel availability-downtime-card">
    <div class="availability-downtime-card__top">
      <div class="availability-rate">
        <div class="availability-rate__icon">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" stroke="rgba(0,212,255,0.25)" stroke-width="3" />
            <circle
              class="availability-rate__progress"
              cx="24" cy="24" r="20"
              stroke="url(#availGrad)"
              stroke-width="3"
              stroke-linecap="round"
              :stroke-dasharray="`${displayDash} ${RING_CIRCUMFERENCE}`"
              transform="rotate(-90 24 24)"
            />
            <defs>
              <linearGradient id="availGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#0066ff" />
                <stop offset="100%" stop-color="#00ffcc" />
              </linearGradient>
            </defs>
            <path
              d="M24 14v10l7 5"
              stroke="#00d4ff"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="availability-rate__info">
          <span class="availability-rate__label">可用率</span>
          <span class="availability-rate__value">
            {{ Math.round(displayDash / 1.257) }}<small>%</small>
          </span>
        </div>
      </div>
    </div>

    <div class="availability-downtime-card__divider" />

    <div class="availability-downtime-card__bottom">
      <div class="availability-downtime-card__sub-title">今日计划外停机时长分析</div>
      <div class="availability-downtime-card__chart">
        <DowntimeChart :data="downtimeData" />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.availability-downtime-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.availability-downtime-card__top {
  flex-shrink: 0;
  padding: 12px 14px 8px;
}

.availability-rate {
  display: flex;
  align-items: center;
  gap: 14px;
}

.availability-rate__icon {
  flex-shrink: 0;
  width: 52px;
  height: 52px;

  svg {
    width: 100%;
    height: 100%;
  }
}

.availability-rate__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.availability-rate__label {
  font-size: 13px;
  color: rgba(232, 244, 255, 0.65);
}

.availability-rate__value {
  font-size: 32px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  background: linear-gradient(90deg, #00d4ff, #00ffcc);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  small {
    font-size: 18px;
    -webkit-text-fill-color: rgba(0, 212, 255, 0.7);
  }
}

.availability-downtime-card__divider {
  flex-shrink: 0;
  height: 1px;
  margin: 0 14px;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.25), transparent);
}

.availability-downtime-card__bottom {
  flex: 1;
  min-height: 0;
  padding: 6px 4px 8px;
  display: flex;
  flex-direction: column;
}

.availability-downtime-card__sub-title {
  flex-shrink: 0;
  padding: 0 6px 4px;
  font-size: 13px;
  font-weight: 600;
  color: #00d4ff;
}

.availability-downtime-card__chart {
  flex: 1;
  min-height: 0;
}
</style>
