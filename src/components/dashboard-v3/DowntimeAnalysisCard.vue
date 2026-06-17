<script setup lang="ts">
import { computed } from 'vue'
import { VChart } from '@/plugins/echarts'
import { CHART_ANIMATION, chartSeriesDelay } from '@/constants/chartAnimation'
import { getV3ChartUI, V3_DOWNTIME_COLORS } from '@/constants/dashboardV3ChartTheme'
import { useDashboardV3Theme } from '@/composables/useDashboardV3Theme'
import V3Panel from './V3Panel.vue'
import type { DowntimeItem } from '@/types/oee'

const DISPLAY_NAMES: Record<string, string> = {
  未知停机: '未知停机',
  故障: '故障停机',
  故障停机: '故障停机',
  人员响应损失: '人员响应损失',
}

const props = defineProps<{
  data: DowntimeItem[]
}>()

const { theme } = useDashboardV3Theme()
const chartUi = computed(() => getV3ChartUI(theme.value))

function formatCompactDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const padM = String(m).padStart(2, '0')
  return m > 0 ? `${h}h ${padM}m` : `${h}h`
}

const totalMinutes = computed(() =>
  props.data.reduce((sum, item) => sum + item.value, 0),
)

const totalLabel = computed(() => formatCompactDuration(totalMinutes.value))

const legendItems = computed(() =>
  props.data.map((item) => ({
    ...item,
    displayName: DISPLAY_NAMES[item.name] ?? item.name,
    color: V3_DOWNTIME_COLORS[item.name] ?? item.color,
    percent: totalMinutes.value
      ? ((item.value / totalMinutes.value) * 100).toFixed(1)
      : '0.0',
    duration: formatCompactDuration(item.value),
  })),
)

const option = computed(() => ({
  ...CHART_ANIMATION,
  tooltip: {
    trigger: 'item',
    backgroundColor: chartUi.value.tooltipBg,
    borderColor: chartUi.value.tooltipBorder,
    textStyle: { color: chartUi.value.tooltipText, fontSize: 11 },
    formatter: '{b}: {c} 分钟 ({d}%)',
  },
  legend: { show: false },
  series: [
    {
      type: 'pie',
      center: ['50%', '50%'],
      radius: ['54%', '80%'],
      padAngle: 3,
      animationDelay: (idx: number) => chartSeriesDelay(idx, 100),
      itemStyle: {
        borderRadius: 4,
        borderColor: chartUi.value.pieBorder,
        borderWidth: 2,
        shadowBlur: 8,
        shadowColor: chartUi.value.shadowColor,
      },
      label: { show: false },
      labelLine: { show: false },
      data: props.data.map((item) => ({
        name: DISPLAY_NAMES[item.name] ?? item.name,
        value: item.value,
        itemStyle: {
          color: V3_DOWNTIME_COLORS[item.name] ?? item.color,
        },
      })),
    },
    {
      type: 'pie',
      center: ['50%', '50%'],
      radius: ['0%', '0%'],
      silent: true,
      tooltip: { show: false },
      label: {
        show: true,
        position: 'center',
        formatter: `{label|总停机时长}\n{value|${totalLabel.value}}`,
        rich: {
          label: {
            fontSize: 11,
            color: chartUi.value.centerLabel,
            lineHeight: 16,
          },
          value: {
            fontSize: 20,
            fontWeight: 700,
            color: chartUi.value.centerValue,
            lineHeight: 26,
          },
        },
      },
      labelLine: { show: false },
      data: [{ value: totalMinutes.value, name: '总停机时长' }],
      z: 10,
    },
  ],
}))
</script>

<template>
  <V3Panel title="今日计划外停机时长分析" class="downtime-card">
    <div class="downtime-card__body">
      <div class="downtime-card__chart">
        <VChart class="downtime-card__echart" :option="option" autoresize />
      </div>

      <div class="downtime-card__detail">
        <ul class="downtime-card__list">
          <li
            v-for="item in legendItems"
            :key="item.name"
            class="downtime-card__item"
          >
            <span class="downtime-card__dot" :style="{ background: item.color }" />
            <span class="downtime-card__name">{{ item.displayName }}</span>
            <span class="downtime-card__duration">{{ item.duration }}</span>
            <span class="downtime-card__percent">{{ item.percent }}%</span>
          </li>
        </ul>
      </div>
    </div>
  </V3Panel>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v3/variables' as *;

.downtime-card {
  :deep(.v3-panel__body) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: $v3-space-sm $v3-space-md;
    min-height: 0;
  }
}

.downtime-card__body {
  display: flex;
  align-items: center;
  gap: $v3-space-lg;
  min-height: 0;
}

.downtime-card__chart {
  flex: 0 0 180px;
  width: 180px;
  height: 180px;
}

.downtime-card__echart {
  width: 100%;
  height: 100%;
}

.downtime-card__detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  min-height: 180px;
}

.downtime-card__list {
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0 0 0 14px;

  &::before {
    content: '';
    position: absolute;
    left: 3px;
    top: 8px;
    bottom: 8px;
    width: 1px;
    background: $v3-divider-strong;
  }
}

.downtime-card__item {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 10px;
  min-height: 34px;
  padding: 6px 0 6px 10px;

  &:not(:last-child) {
    border-bottom: 1px solid $v3-divider;
  }
}

.downtime-card__dot {
  position: absolute;
  left: -11px;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translateY(-50%);
  box-shadow: 0 0 6px $v3-control-border;
}

.downtime-card__name {
  font-size: 12px;
  color: $v3-text-secondary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.downtime-card__duration {
  font-size: 13px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: $v3-text;
  white-space: nowrap;
}

.downtime-card__percent {
  min-width: 44px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: $v3-text-muted;
  text-align: right;
  white-space: nowrap;
}
</style>
