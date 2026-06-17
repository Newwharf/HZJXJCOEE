<script setup lang="ts">
import { computed } from 'vue'
import { VChart } from '@/plugins/echarts'
import { CHART_ANIMATION, chartSeriesDelay } from '@/constants/chartAnimation'
import { getV3ChartUI } from '@/constants/dashboardV3ChartTheme'
import { useDashboardV3Theme } from '@/composables/useDashboardV3Theme'
import type { DailyCoverageItem } from '@/types/oee'

const props = defineProps<{
  dailyData: DailyCoverageItem[]
  highlightDate?: string
}>()

const { theme } = useDashboardV3Theme()

const option = computed(() => {
  const chartUi = getV3ChartUI(theme.value)
  const barTop = theme.value === 'light' ? '#5a8f00' : '#a6e22e'
  const barBottom = theme.value === 'light'
    ? 'rgba(90, 143, 0, 0.22)'
    : 'rgba(166, 226, 46, 0.25)'

  return {
    ...CHART_ANIMATION,
    grid: {
      top: 24,
      right: 8,
      bottom: 22,
      left: 32,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartUi.tooltipBg,
      borderColor: chartUi.tooltipBorder,
      textStyle: { color: chartUi.tooltipText, fontSize: 11 },
      formatter: (params: Array<{ name: string; value: number }>) => {
        const item = params[0]
        return `${item.name}<br/>覆盖率 ${item.value}%`
      },
    },
    xAxis: {
      type: 'category',
      data: props.dailyData.map((item) => item.date),
      axisLine: { lineStyle: { color: chartUi.axis } },
      axisTick: { show: false },
      axisLabel: {
        color: (value: string) =>
          value === props.highlightDate ? '#fadb14' : chartUi.axisLabel,
        fontSize: 10,
        fontWeight: (value: string) => (value === props.highlightDate ? '600' : '400'),
      },
    },
    yAxis: {
      type: 'value',
      min: 70,
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: chartUi.axisLabel,
        fontSize: 10,
        formatter: '{value}%',
      },
      splitLine: {
        lineStyle: { color: chartUi.splitLine },
      },
    },
    series: [
      {
        type: 'bar',
        data: props.dailyData.map((item) => ({
          value: item.rate,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: barTop },
                { offset: 1, color: barBottom },
              ],
            },
            borderRadius: [3, 3, 0, 0],
          },
        })),
        barWidth: '48%',
        animationDelay: (idx: number) => chartSeriesDelay(idx, 80),
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontSize: 9,
          color: chartUi.axisLabel,
          fontWeight: 500,
        },
      },
    ],
  }
})
</script>

<template>
  <VChart class="v3-coverage-chart" :option="option" autoresize />
</template>

<style scoped lang="scss">
.v3-coverage-chart {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
