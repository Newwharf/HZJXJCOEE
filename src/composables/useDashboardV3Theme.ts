import { computed, inject, onMounted, provide, ref, watch, type InjectionKey, type Ref } from 'vue'

export type DashboardV3Theme = 'dark' | 'light'

const STORAGE_KEY = 'dashboard-v3-theme'

export interface DashboardV3ThemeContext {
  theme: Ref<DashboardV3Theme>
  isDark: Ref<boolean>
  setTheme: (value: DashboardV3Theme) => void
  toggleTheme: () => void
}

export const DASHBOARD_V3_THEME_KEY: InjectionKey<DashboardV3ThemeContext> =
  Symbol('dashboard-v3-theme')

function readStoredTheme(): DashboardV3Theme {
  if (typeof localStorage === 'undefined') return 'dark'
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'light' ? 'light' : 'dark'
}

export function provideDashboardV3Theme() {
  const theme = ref<DashboardV3Theme>(readStoredTheme())

  function setTheme(value: DashboardV3Theme) {
    theme.value = value
    localStorage.setItem(STORAGE_KEY, value)
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  const context: DashboardV3ThemeContext = {
    theme,
    isDark: computed(() => theme.value === 'dark'),
    setTheme,
    toggleTheme,
  }

  provide(DASHBOARD_V3_THEME_KEY, context)

  function syncDocumentTheme(value: DashboardV3Theme) {
    document.documentElement.dataset.v3Theme = value
  }

  watch(theme, syncDocumentTheme, { immediate: true })

  onMounted(() => {
    theme.value = readStoredTheme()
    syncDocumentTheme(theme.value)
  })

  return context
}

export function useDashboardV3Theme() {
  const context = inject(DASHBOARD_V3_THEME_KEY)
  if (!context) {
    throw new Error('useDashboardV3Theme must be used within DashboardV3Layout')
  }
  return context
}
