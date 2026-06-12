<script setup lang="ts">
import DashboardV2Layout from '@/layouts/DashboardV2Layout.vue'
import DashboardV2Header from '@/components/dashboard-v2/DashboardV2Header.vue'
import AvailabilityCard from '@/components/dashboard-v2/AvailabilityCard.vue'
import MetricCard from '@/components/dashboard-v2/MetricCard.vue'
import GlassPanel from '@/components/dashboard-v2/GlassPanel.vue'
import MachineModel from '@/components/dashboard/MachineModel.vue'
import ProductionTimelinePanel from '@/components/dashboard/ProductionTimelinePanel.vue'
import CoverageRate from '@/components/dashboard/CoverageRate.vue'
import TimelineHeatmap from '@/components/dashboard/TimelineHeatmap.vue'
import { useDashboardDate } from '@/composables/useDashboardDate'

const { selectedDate, dashboardData, minDate, maxDate } = useDashboardDate()
const data = dashboardData

const focusMetrics = [
  {
    key: 'personnelDuration',
    icon: 'personnelDuration' as const,
    label: '人员响应损失时长',
    valueKey: 'personnelLossDuration' as const,
    unit: '分钟',
    trendKey: 'personnelLossDuration' as const,
    trendColor: '#5c6b7e',
  },
  {
    key: 'personnelCount',
    icon: 'personnelCount' as const,
    label: '人员响应损失次数',
    valueKey: 'personnelLossCount' as const,
    unit: '次',
    trendKey: 'personnelLossCount' as const,
    trendColor: '#5c6b7e',
  },
  {
    key: 'avgFaceTime',
    icon: 'avgFaceTime' as const,
    label: '平均换面时间',
    valueKey: 'avgFaceChangeTime' as const,
    unit: '分钟',
    trendKey: 'avgFaceChangeTime' as const,
    trendColor: '#5c6b7e',
  },
  {
    key: 'faceCount',
    icon: 'faceCount' as const,
    label: '换面次数',
    valueKey: 'faceChangeCount' as const,
    unit: '次',
    trendKey: 'faceChangeCount' as const,
    trendColor: '#5c6b7e',
  },
  {
    key: 'avgProdTime',
    icon: 'avgProdTime' as const,
    label: '平均换产时间',
    valueKey: 'avgProductionChangeTime' as const,
    unit: '分钟',
    trendKey: 'avgProductionChangeTime' as const,
    trendColor: '#5c6b7e',
  },
  {
    key: 'prodCount',
    icon: 'prodCount' as const,
    label: '换产次数',
    valueKey: 'productionChangeCount' as const,
    unit: '次',
    trendKey: 'productionChangeCount' as const,
    trendColor: '#5c6b7e',
  },
]
</script>

<template>
  <DashboardV2Layout>
    <div class="dashboard-v2">
      <DashboardV2Header
        v-model:selected-date="selectedDate"
        :min-date="minDate"
        :max-date="maxDate"
      />

      <main class="dashboard-v2__body">
        <aside class="dashboard-v2__col dashboard-v2__col--left">
          <AvailabilityCard
            :key="selectedDate"
            :rate="data.availabilityRate"
            :downtime-data="data.downtimeAnalysis"
          />

          <GlassPanel title="今日生产指标" class="dashboard-v2__metrics-panel">
            <div class="dashboard-v2__metrics-list">
              <MetricCard
                v-for="metric in focusMetrics"
                :key="`${selectedDate}-${metric.key}`"
                :icon="metric.icon"
                :label="metric.label"
                :value="data[metric.valueKey]"
                :unit="metric.unit"
                :trend="data.focusMetricTrends[metric.trendKey]"
                :trend-color="metric.trendColor"
                :day-change="data.focusMetricDayChanges[metric.trendKey]"
              />
            </div>
          </GlassPanel>
        </aside>

        <section class="dashboard-v2__col dashboard-v2__col--center">
          <GlassPanel class="dashboard-v2__model-panel">
            <div class="dashboard-v2__model-wrap">
              <MachineModel
                v-model:selected-date="selectedDate"
                variant="muted"
                :status="data.equipmentStatus"
                :status-note="data.equipmentStatusNote"
                :status-duration="data.equipmentStatusDuration"
                :status-durations="data.equipmentStatusDurations"
                :key-time-metrics="data.keyTimeMetrics"
                :min-date="minDate"
                :max-date="maxDate"
              />
            </div>
          </GlassPanel>

          <div class="dashboard-v2__bottom-row">
            <GlassPanel title="今日事件分布" class="dashboard-v2__events-panel">
              <TimelineHeatmap
                :key="selectedDate"
                variant="muted"
                :segments="data.timeline"
                :event-details="data.eventDetails"
              />
            </GlassPanel>

            <GlassPanel title="识别覆盖率" class="dashboard-v2__coverage-panel">
              <CoverageRate
                :key="selectedDate"
                variant="muted"
                :daily-data="data.visualRecognitionDaily"
              />
            </GlassPanel>
          </div>
        </section>

        <aside class="dashboard-v2__col dashboard-v2__col--right">
          <GlassPanel title="今日生产时间轴" class="dashboard-v2__timeline-panel">
            <ProductionTimelinePanel
              :key="selectedDate"
              variant="muted"
              :segments="data.timeline"
              :event-details="data.eventDetails"
            />
          </GlassPanel>
        </aside>
      </main>
    </div>
  </DashboardV2Layout>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v2/variables' as *;

.dashboard-v2 {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0 $v2-space-xxl $v2-space-xl;
}

.dashboard-v2__body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: $v2-space-lg;
  min-height: 0;
}

.dashboard-v2__col {
  display: flex;
  flex-direction: column;
  gap: $v2-space-lg;
  min-height: 0;
}

.dashboard-v2__col--left {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.dashboard-v2__metrics-panel {
  flex: 1;
  min-height: 0;

  :deep(.panel__body) {
    padding: 0;
    display: flex;
    flex-direction: column;
  }
}

.dashboard-v2__metrics-list {
  flex: 1;
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  min-height: 0;
}

.dashboard-v2__model-panel {
  flex: 1;
  min-height: 0;

  :deep(.panel__body) {
    padding: 0;
    height: 100%;
  }
}

.dashboard-v2__model-wrap {
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $v2-bg-surface;
  border-radius: 0 0 $v2-radius-md $v2-radius-md;
  overflow: hidden;

  :deep(.machine-model) {
    width: 100%;
    height: 100%;
  }

  :deep(.machine-model__date) {
    display: none;
  }

  :deep(.machine-model__status) {
    border-radius: $v2-radius-sm;
  }

  :deep(.machine-model__tag) {
    border-radius: $v2-radius-sm;
  }
}

.dashboard-v2__bottom-row {
  flex-shrink: 0;
  height: 280px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: $v2-space-lg;
  min-height: 0;
}

.dashboard-v2__events-panel,
.dashboard-v2__coverage-panel,
.dashboard-v2__timeline-panel {
  min-height: 0;
  overflow: hidden;

  :deep(.panel__body) {
    padding: $v2-space-sm $v2-space-md;
    overflow: hidden;
  }

  :deep(.heatmap-legend__item),
  :deep(.timeline-panel__label),
  :deep(.coverage-rate__label) {
    color: $v2-text-muted;
  }
}

.dashboard-v2__timeline-panel {
  flex: 1;
  height: 100%;
}
</style>
