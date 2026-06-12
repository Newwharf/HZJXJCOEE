<script setup lang="ts">
import { computed } from 'vue'
import { VChart } from '@/plugins/echarts'
import { CHART_ANIMATION, chartSeriesDelay } from '@/constants/chartAnimation'
import type { DailyCoverageItem } from '@/types/oee'
import { V2_CHART_UI } from '@/constants/dashboardV2ChartTheme'

const props = defineProps<{
  dailyData: DailyCoverageItem[]
  variant?: 'default' | 'muted'
}>()

const isMuted = computed(() => props.variant === 'muted')

const option = computed(() => ({
  ...CHART_ANIMATION,
  grid: {
    top: 20,
    right: 10,
    bottom: 24,
    left: 34,
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: isMuted.value ? V2_CHART_UI.tooltipBg : 'rgba(6, 30, 60, 0.9)',
    borderColor: isMuted.value ? V2_CHART_UI.tooltipBorder : 'rgba(0, 212, 255, 0.3)',
    textStyle: { color: isMuted.value ? V2_CHART_UI.tooltipText : '#e8f4ff', fontSize: 11 },
    formatter: (params: Array<{ name: string; value: number }>) => {
      const item = params[0]
      return `${item.name}<br/>覆盖率 ${item.value}%`
    },
  },
  xAxis: {
    type: 'category',
    data: props.dailyData.map((item) => item.date),
    axisLine: { lineStyle: { color: isMuted.value ? V2_CHART_UI.axis : 'rgba(0, 212, 255, 0.15)' } },
    axisTick: { show: false },
    axisLabel: {
      color: isMuted.value ? V2_CHART_UI.axisLabel : 'rgba(232, 244, 255, 0.45)',
      fontSize: 10,
    },
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 100,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: isMuted.value ? V2_CHART_UI.axisLabel : 'rgba(232, 244, 255, 0.4)',
      fontSize: 10,
      formatter: '{value}%',
    },
    splitLine: {
      lineStyle: { color: isMuted.value ? V2_CHART_UI.splitLine : 'rgba(0, 212, 255, 0.08)' },
    },
  },
  series: [
    {
      type: 'bar',
      data: props.dailyData.map((item) => item.rate),
      barWidth: '42%',
      animationDelay: (idx: number) => chartSeriesDelay(idx, 100),
      itemStyle: {
        color: isMuted.value ? V2_CHART_UI.bar : '#7b61ff',
        borderRadius: [3, 3, 0, 0],
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
        fontSize: 9,
        color: isMuted.value ? V2_CHART_UI.axisLabel : 'rgba(232, 244, 255, 0.55)',
      },
    },
  ],
}))
</script>

<template>
  <VChart class="coverage-rate__chart" :option="option" autoresize />
</template>

<style scoped lang="scss">
.coverage-rate__chart {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
