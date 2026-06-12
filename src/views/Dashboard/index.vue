<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import AvailabilityDowntimeCard from '@/components/dashboard/AvailabilityDowntimeCard.vue'
import FocusMetricItem from '@/components/dashboard/FocusMetricItem.vue'
import MachineModel from '@/components/dashboard/MachineModel.vue'
import ProductionTimelinePanel from '@/components/dashboard/ProductionTimelinePanel.vue'
import CoverageRate from '@/components/dashboard/CoverageRate.vue'
import TimelineHeatmap from '@/components/dashboard/TimelineHeatmap.vue'
import { useDashboardDate } from '@/composables/useDashboardDate'

const { selectedDate, dashboardData, minDate, maxDate } = useDashboardDate()
const data = dashboardData
</script>

<template>
  <DashboardLayout>
    <div class="oee-dashboard">
      <DashboardHeader />

      <main class="oee-dashboard__body">
        <!-- 左侧指标 -->
        <aside class="oee-dashboard__side oee-dashboard__side--left">
          <AvailabilityDowntimeCard
            :key="selectedDate"
            :rate="data.availabilityRate"
            :downtime-data="data.downtimeAnalysis"
          />

          <section class="panel panel--metrics">
            <div class="panel-title">今日生产指标</div>
            <div class="panel-body panel-body--focus-metrics">
              <FocusMetricItem
                :key="`${selectedDate}-personnelDuration`"
                icon="personnelDuration"
                label="人员响应损失时长"
                :value="data.personnelLossDuration"
                unit="分钟"
                :trend="data.focusMetricTrends.personnelLossDuration"
                trend-color="#ff6b9d"
                :day-change="data.focusMetricDayChanges.personnelLossDuration"
                :chart-delay="0"
              />
              <FocusMetricItem
                :key="`${selectedDate}-personnelCount`"
                icon="personnelCount"
                label="人员响应损失次数"
                :value="data.personnelLossCount"
                unit="次"
                :trend="data.focusMetricTrends.personnelLossCount"
                trend-color="#ff6b9d"
                :day-change="data.focusMetricDayChanges.personnelLossCount"
                :chart-delay="70"
              />
              <FocusMetricItem
                :key="`${selectedDate}-avgFaceTime`"
                icon="avgFaceTime"
                label="平均换面时间"
                :value="data.avgFaceChangeTime"
                unit="分钟"
                :trend="data.focusMetricTrends.avgFaceChangeTime"
                trend-color="#00d4ff"
                :day-change="data.focusMetricDayChanges.avgFaceChangeTime"
                :chart-delay="140"
              />
              <FocusMetricItem
                :key="`${selectedDate}-faceCount`"
                icon="faceCount"
                label="换面次数"
                :value="data.faceChangeCount"
                unit="次"
                :trend="data.focusMetricTrends.faceChangeCount"
                trend-color="#ffaa00"
                :day-change="data.focusMetricDayChanges.faceChangeCount"
                :chart-delay="210"
              />
              <FocusMetricItem
                :key="`${selectedDate}-avgProdTime`"
                icon="avgProdTime"
                label="平均换产时间"
                :value="data.avgProductionChangeTime"
                unit="分钟"
                :trend="data.focusMetricTrends.avgProductionChangeTime"
                trend-color="#7b61ff"
                :day-change="data.focusMetricDayChanges.avgProductionChangeTime"
                :chart-delay="280"
              />
              <FocusMetricItem
                :key="`${selectedDate}-prodCount`"
                icon="prodCount"
                label="换产次数"
                :value="data.productionChangeCount"
                unit="次"
                :trend="data.focusMetricTrends.productionChangeCount"
                trend-color="#7b61ff"
                :day-change="data.focusMetricDayChanges.productionChangeCount"
                :chart-delay="350"
              />
            </div>
          </section>
        </aside>

        <!-- 中间区域 -->
        <section class="oee-dashboard__center">
          <div class="center-model panel">
            <MachineModel
              v-model:selected-date="selectedDate"
              status-interactive
              :status="data.equipmentStatus"
              :status-note="data.equipmentStatusNote"
              :status-duration="data.equipmentStatusDuration"
              :status-durations="data.equipmentStatusDurations"
              :key-time-metrics="data.keyTimeMetrics"
              :min-date="minDate"
              :max-date="maxDate"
            />
          </div>

          <div class="center-bottom">
            <section class="panel center-events">
              <div class="panel-title">今日事件分布</div>
              <div class="panel-body panel-body--heatmap">
                <TimelineHeatmap
                  :key="selectedDate"
                  :segments="data.timeline"
                  :event-details="data.eventDetails"
                />
              </div>
            </section>

            <section class="panel center-coverage">
              <div class="panel-title">识别覆盖率</div>
              <div class="panel-body panel-body--coverage">
                <CoverageRate
                  :key="selectedDate"
                  :daily-data="data.visualRecognitionDaily"
                />
              </div>
            </section>
          </div>
        </section>

        <!-- 右侧指标 -->
        <aside class="oee-dashboard__side oee-dashboard__side--right">
          <section class="panel panel--full">
            <div class="panel-title">今日生产时间轴</div>
            <div class="panel-body panel-body--production-timeline">
              <ProductionTimelinePanel
                :key="selectedDate"
                :segments="data.timeline"
                :event-details="data.eventDetails"
              />
            </div>
          </section>
        </aside>
      </main>
    </div>
  </DashboardLayout>
</template>

<style scoped lang="scss">
.oee-dashboard {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px 28px 20px;
}

.oee-dashboard__body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 16px;
  min-height: 0;
}

.oee-dashboard__side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  height: 100%;
}

.oee-dashboard__side--left {
  gap: 12px;
}

.oee-dashboard__center {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.center-model {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }
}

.center-bottom {
  flex-shrink: 0;
  height: 280px;
  display: flex;
  gap: 12px;
  min-height: 0;
}

.center-events,
.center-coverage {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel--metrics {
  flex: 1;
}

.panel--full {
  flex: 1;
  height: 100%;
}

.panel-body {
  flex: 1;
  padding: 12px;
  min-height: 0;
}

.panel-body--metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-body--production-timeline {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 8px 10px;
}

.panel-body--focus-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(3, 1fr);
  gap: 10px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.panel-body--heatmap {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 8px 12px 10px;
}

.panel-body--coverage {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 4px 8px 8px;
}

</style>
