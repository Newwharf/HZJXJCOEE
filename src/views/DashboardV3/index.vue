<script setup lang="ts">
import DashboardV3Layout from '@/layouts/DashboardV3Layout.vue'
import DashboardV3Header from '@/components/dashboard-v3/DashboardV3Header.vue'
import AvailabilityCard from '@/components/dashboard-v3/AvailabilityCard.vue'
import ProductionMetricsCard from '@/components/dashboard-v3/ProductionMetricsCard.vue'
import MachineOverviewCard from '@/components/dashboard-v3/MachineOverviewCard.vue'
import EventDistributionCard from '@/components/dashboard-v3/EventDistributionCard.vue'
import DowntimeAnalysisCard from '@/components/dashboard-v3/DowntimeAnalysisCard.vue'
import ProductionTimelineCard from '@/components/dashboard-v3/ProductionTimelineCard.vue'
import { useDashboardV3Date } from '@/composables/useDashboardV3Date'

const { selectedDate, dashboardData, minDate, maxDate } = useDashboardV3Date()
</script>

<template>
  <DashboardV3Layout>
    <div class="dashboard-v3">
      <DashboardV3Header
        v-model:selected-date="selectedDate"
        :min-date="minDate"
        :max-date="maxDate"
      />

      <main class="dashboard-v3__body">
        <section class="dashboard-v3__main">
          <div class="dashboard-v3__row dashboard-v3__row--top">
            <AvailabilityCard
              :key="`${selectedDate}-avail`"
              class="dashboard-v3__card dashboard-v3__card--availability"
              :rate="dashboardData.availabilityRate"
              :day-change="3.2"
            />
            <ProductionMetricsCard
              :key="`${selectedDate}-metrics`"
              class="dashboard-v3__card dashboard-v3__card--metrics"
              :data="dashboardData"
            />
          </div>

          <MachineOverviewCard
            :key="`${selectedDate}-machine`"
            class="dashboard-v3__card dashboard-v3__card--machine"
            :status="dashboardData.equipmentStatus"
            :status-duration="dashboardData.equipmentStatusDuration"
            :key-time-metrics="dashboardData.keyTimeMetrics"
          />

          <div class="dashboard-v3__row dashboard-v3__row--bottom">
            <EventDistributionCard
              :key="`${selectedDate}-events`"
              class="dashboard-v3__card dashboard-v3__card--events"
              :segments="dashboardData.timeline"
              :event-details="dashboardData.eventDetails"
              :stats="dashboardData.eventDistributionStats"
            />
            <DowntimeAnalysisCard
              :key="`${selectedDate}-downtime`"
              class="dashboard-v3__card dashboard-v3__card--downtime"
              :data="dashboardData.downtimeAnalysis"
            />
          </div>
        </section>

        <aside class="dashboard-v3__side">
          <ProductionTimelineCard
            :key="`${selectedDate}-timeline`"
            class="dashboard-v3__card dashboard-v3__card--timeline"
            :segments="dashboardData.timeline"
            :event-details="dashboardData.eventDetails"
          />
        </aside>
      </main>
    </div>
  </DashboardV3Layout>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v3/variables' as *;

.dashboard-v3 {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: $v3-space-md $v3-space-xxl $v3-space-xl;
}

.dashboard-v3__body {
  flex: 1;
  display: flex;
  gap: $v3-space-md;
  min-height: 0;
}

.dashboard-v3__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $v3-space-md;
  min-width: 0;
  min-height: 0;
}

.dashboard-v3__side {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.dashboard-v3__row {
  display: flex;
  gap: $v3-space-md;
  min-height: 0;

  &--top {
    flex: 30;
  }

  &--bottom {
    flex: 25;
  }
}

.dashboard-v3__card {
  min-height: 0;

  :deep(.v3-panel__body) {
    flex: 1;
    min-height: 0;
  }

  &--availability {
    flex: 0 0 $v3-availability-width;
    width: $v3-availability-width;
    min-width: $v3-availability-width;
  }

  &--downtime,
  &--events {
    flex: 1;
    min-width: 0;
  }

  &--events {
    :deep(.v3-panel__body) {
      justify-content: flex-start;
      overflow: visible;
    }
  }

  &--metrics {
    flex: 1;
    min-width: 0;
  }

  &--machine {
    flex: 0 0 auto;

    :deep(.v3-panel__body) {
      flex: 0 0 auto;
    }
  }

  &--timeline {
    flex: 1;
    height: 100%;
  }
}
</style>
