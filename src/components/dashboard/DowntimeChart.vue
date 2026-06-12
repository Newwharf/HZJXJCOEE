<script setup lang="ts">
import { computed } from 'vue'
import { VChart } from '@/plugins/echarts'
import { CHART_ANIMATION, chartSeriesDelay } from '@/constants/chartAnimation'
import type { DowntimeItem } from '@/types/oee'
import { V2_CHART_UI, V2_DOWNTIME_COLORS } from '@/constants/dashboardV2ChartTheme'

const props = defineProps<{
  data: DowntimeItem[]
  variant?: 'default' | 'muted'
}>()

const isMuted = computed(() => props.variant === 'muted')

const pieLayout = computed(() => {
  if (isMuted.value) {
    return {
      top: '4%',
      bottom: '24%',
      left: '4%',
      right: '4%',
      center: ['50%', '44%'] as [string, string],
    }
  }

  return {
    top: '2%',
    bottom: '14%',
    left: '2%',
    right: '2%',
    center: ['50%', '50%'] as [string, string],
  }
})

const totalDowntime = computed(() =>
  props.data.reduce((sum, item) => sum + item.value, 0),
)

const centerLabelRich = computed(() => {
  if (isMuted.value) {
    const valueStyle = {
      fontSize: 18,
      fontWeight: 600,
      color: V2_CHART_UI.centerValue,
      lineHeight: 20,
    }
    return {
      value: valueStyle,
      unit: { ...valueStyle, padding: [0, 0, 0, 1] },
      label: {
        fontSize: 10,
        color: V2_CHART_UI.centerLabel,
        lineHeight: 14,
      },
    }
  }

  return {
    value: {
      fontSize: 30,
      fontWeight: 700,
      color: '#00d4ff',
      lineHeight: 34,
    },
    unit: {
      fontSize: 14,
      color: 'rgba(232, 244, 255, 0.5)',
      padding: [0, 0, 0, 2],
    },
    label: {
      fontSize: 13,
      color: 'rgba(232, 244, 255, 0.6)',
      lineHeight: 20,
    },
  }
})

const option = computed(() => ({
  ...CHART_ANIMATION,
  tooltip: {
    trigger: 'item',
    backgroundColor: isMuted.value ? V2_CHART_UI.tooltipBg : 'rgba(6, 30, 60, 0.9)',
    borderColor: isMuted.value ? V2_CHART_UI.tooltipBorder : 'rgba(0, 212, 255, 0.3)',
    textStyle: { color: isMuted.value ? V2_CHART_UI.tooltipText : '#e8f4ff' },
    formatter: '{b}: {c} 分钟 ({d}%)',
  },
  legend: {
    orient: 'horizontal',
    bottom: isMuted.value ? 14 : 0,
    left: 'center',
    width: isMuted.value ? '94%' : undefined,
    textStyle: {
      color: isMuted.value ? V2_CHART_UI.axisLabel : 'rgba(232, 244, 255, 0.75)',
      fontSize: isMuted.value ? 9 : 10,
    },
    itemWidth: 8,
    itemHeight: 8,
    itemGap: isMuted.value ? 8 : 12,
  },
  series: [
    {
      type: 'pie',
      ...pieLayout.value,
      radius: ['48%', '75%'],
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: (idx: number) => chartSeriesDelay(idx, 120),
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 4,
        borderColor: isMuted.value ? V2_CHART_UI.pieBorder : '#0a1628',
        borderWidth: 2,
      },
      label: {
        show: true,
        color: isMuted.value ? V2_CHART_UI.tooltipText : 'rgba(232, 244, 255, 0.85)',
        fontSize: 10,
        lineHeight: 14,
        formatter: '{b}\n{c}min',
      },
      labelLine: {
        show: true,
        length: 10,
        length2: 8,
        lineStyle: {
          color: isMuted.value ? V2_CHART_UI.axis : 'rgba(0, 212, 255, 0.35)',
        },
      },
      labelLayout: {
        hideOverlap: true,
      },
      data: props.data.map((item) => ({
        name: item.name,
        value: item.value,
        itemStyle: {
          color: isMuted.value
            ? (V2_DOWNTIME_COLORS[item.name] ?? V2_CHART_UI.bar)
            : item.color,
        },
      })),
    },
    {
      type: 'pie',
      ...pieLayout.value,
      radius: ['0%', '0%'],
      silent: true,
      tooltip: { show: false },
      label: {
        show: true,
        position: 'center',
        formatter: `{value|${totalDowntime.value}}{unit|分钟}\n{label|总停机时间}`,
        rich: centerLabelRich.value,
      },
      labelLine: { show: false },
      data: [{ value: totalDowntime.value, name: '总停机时间' }],
      z: 10,
    },
  ],
}))
</script>

<template>
  <VChart
    class="downtime-chart"
    :class="{ 'downtime-chart--compact': isMuted }"
    :option="option"
    autoresize
  />
</template>

<style scoped lang="scss">
.downtime-chart {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.downtime-chart--compact {
  height: 180px;
  min-height: 180px;
}
</style>
