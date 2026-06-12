import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDashboardStore = defineStore('dashboard', () => {
  const lastUpdated = ref(new Date().toISOString())

  function refreshTimestamp() {
    lastUpdated.value = new Date().toISOString()
  }

  return {
    lastUpdated,
    refreshTimestamp,
  }
})
