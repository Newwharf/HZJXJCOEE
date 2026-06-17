<script setup lang="ts">
import { computed } from 'vue'
import MiniMetricCard from './MiniMetricCard.vue'
import { getV3MetricColors } from '@/constants/dashboardV3ChartTheme'
import { useDashboardV3Theme } from '@/composables/useDashboardV3Theme'
import type { OeeMetrics } from '@/types/oee'

defineProps<{
  data: OeeMetrics
}>()

const { theme } = useDashboardV3Theme()
const metricColors = computed(() => getV3MetricColors(theme.value))

const metrics = [
  {
    key: 'personnelLossDuration',
    label: '人员响应损失时长',
    unitLabel: '分钟',
    trendKey: 'personnelLossDuration' as const,
    colorKey: 'personnelDuration' as const,
    changePercent: 12.3,
  },
  {
    key: 'personnelLossCount',
    label: '人员响应损失次数',
    unitLabel: '次',
    trendKey: 'personnelLossCount' as const,
    colorKey: 'personnelCount' as const,
    changePercent: 14.3,
  },
  {
    key: 'avgFaceChangeTime',
    label: '平均换面时间',
    unitLabel: '分钟',
    trendKey: 'avgFaceChangeTime' as const,
    colorKey: 'avgFaceTime' as const,
    changePercent: 8.7,
  },
  {
    key: 'faceChangeCount',
    label: '换面次数',
    unitLabel: '次',
    trendKey: 'faceChangeCount' as const,
    colorKey: 'faceCount' as const,
    changePercent: 10.0,
  },
  {
    key: 'avgProductionChangeTime',
    label: '平均换产时间',
    unitLabel: '分钟',
    trendKey: 'avgProductionChangeTime' as const,
    colorKey: 'avgProdTime' as const,
    changePercent: 6.4,
  },
  {
    key: 'productionChangeCount',
    label: '换产次数',
    unitLabel: '次',
    trendKey: 'productionChangeCount' as const,
    colorKey: 'prodCount' as const,
    changePercent: 20.0,
  },
] as const
</script>

<template>
  <div class="production-metrics">
    <div class="production-metrics__grid">
      <MiniMetricCard
        v-for="metric in metrics"
        :key="metric.key"
        :label="metric.label"
        :value="data[metric.key]"
        :unit-label="metric.unitLabel"
        :trend="data.focusMetricTrends[metric.trendKey]"
        :trend-color="metricColors[metric.colorKey]"
        :change-percent="metric.changePercent"
        :day-change="data.focusMetricDayChanges[metric.trendKey]"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v3/variables' as *;

.production-metrics {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: transparent;
}

.production-metrics__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: $v3-space-sm;
  flex: 1;
  min-height: 0;
}
</style>
