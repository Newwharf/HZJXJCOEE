import { computed, ref } from 'vue'
import { oeeDashboardV3Data } from '@/mock/oeeDashboardV3'

export const V3_DEFAULT_DATE = '2025-06-03'
export const V3_DATE_MIN = '2025-05-28'
export const V3_DATE_MAX = '2025-06-03'

export function useDashboardV3Date() {
  const selectedDate = ref(V3_DEFAULT_DATE)

  const dashboardData = computed(() => oeeDashboardV3Data)

  return {
    selectedDate,
    dashboardData,
    minDate: V3_DATE_MIN,
    maxDate: V3_DATE_MAX,
  }
}
