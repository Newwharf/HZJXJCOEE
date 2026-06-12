import { computed, ref } from 'vue'
import {
  DASHBOARD_DATE_MAX,
  DASHBOARD_DATE_MIN,
  DEFAULT_DASHBOARD_DATE,
  getDashboardDataByDate,
} from '@/mock/oeeDashboardByDate'

export function useDashboardDate() {
  const selectedDate = ref(DEFAULT_DASHBOARD_DATE)

  const dashboardData = computed(() => getDashboardDataByDate(selectedDate.value))

  return {
    selectedDate,
    dashboardData,
    minDate: DASHBOARD_DATE_MIN,
    maxDate: DASHBOARD_DATE_MAX,
  }
}
