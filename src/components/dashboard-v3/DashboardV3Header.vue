<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useDashboardV3Theme } from '@/composables/useDashboardV3Theme'

defineProps<{
  selectedDate: string
  minDate: string
  maxDate: string
}>()

const emit = defineEmits<{
  'update:selectedDate': [value: string]
}>()

const { isDark, toggleTheme } = useDashboardV3Theme()

const workshops = ['全部车间', '一车间', '二车间']
const lines = ['全部产线', '产线 A', '产线 B']
const machines = ['全部机床', 'CNC-7500', 'DMU 50']

const selectedWorkshop = ref(workshops[0])
const selectedLine = ref(lines[0])
const selectedMachine = ref(machines[0])
const searchQuery = ref('')
const currentTime = ref('')

let timer: ReturnType<typeof setInterval> | null = null

function updateTime() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  currentTime.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

function onDateChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (value) emit('update:selectedDate', value)
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <header class="v3-header">
    <div class="v3-header__brand">
      <div class="v3-header__logo" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" stroke="#a6e22e" stroke-width="1.5" opacity="0.4" />
          <circle cx="16" cy="16" r="8" stroke="#a6e22e" stroke-width="2" />
          <circle cx="16" cy="16" r="3" fill="#a6e22e" />
          <path d="M16 4v4M16 24v4M4 16h4M24 16h4" stroke="#a6e22e" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
        </svg>
      </div>
      <h1 class="v3-header__title">Machining OEE Dashboard</h1>
    </div>

    <div class="v3-header__filters">
      <label class="v3-header__select">
        <select v-model="selectedWorkshop">
          <option v-for="item in workshops" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>
      <label class="v3-header__select">
        <select v-model="selectedLine">
          <option v-for="item in lines" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>
      <label class="v3-header__select">
        <select v-model="selectedMachine">
          <option v-for="item in machines" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>
      <label class="v3-header__date">
        <svg class="v3-header__date-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.2" />
          <path d="M2 6.5h12M5.5 1.5v2M10.5 1.5v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
        </svg>
        <input
          type="date"
          :value="selectedDate"
          :min="minDate"
          :max="maxDate"
          aria-label="选择日期"
          @change="onDateChange"
        />
      </label>
    </div>

    <div class="v3-header__actions">
      <div class="v3-header__live">
        <time class="v3-header__time">{{ currentTime }}</time>
        <span class="v3-header__live-badge">
          <span class="v3-header__live-dot" aria-hidden="true" />
          实时数据
        </span>
      </div>

      <label class="v3-header__search">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.3" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
        </svg>
        <input v-model="searchQuery" type="search" placeholder="搜索机床 / 事件 / 编号" />
      </label>

      <button
        type="button"
        class="v3-header__icon-btn"
        :aria-label="isDark ? '切换为亮色模式' : '切换为暗色模式'"
        @click="toggleTheme"
      >
        <svg v-if="isDark" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="3.5" stroke="currentColor" stroke-width="1.3" />
          <path
            d="M10 2v1.6M10 16.4V18M2 10h1.6M16.4 10H18M4.2 4.2l1.1 1.1M14.7 14.7l1.1 1.1M4.2 15.8l1.1-1.1M14.7 5.3l1.1-1.1"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
          />
        </svg>
        <svg v-else viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M15.5 11.8a5.5 5.5 0 01-7.3-7.3 5.5 5.5 0 107.3 7.3z"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use '@/styles/dashboard-v3/variables' as *;

.v3-header {
  display: flex;
  align-items: center;
  gap: $v3-space-xl;
  flex-shrink: 0;
  height: 56px;
  margin-bottom: $v3-space-md;
  padding: 0 $v3-space-xs;
  z-index: $v3-z-header;
}

.v3-header__brand {
  display: flex;
  align-items: center;
  gap: $v3-space-md;
  flex-shrink: 0;
}

.v3-header__logo {
  width: 32px;
  height: 32px;

  svg {
    width: 100%;
    height: 100%;
  }
}

.v3-header__title {
  font-size: 16px;
  font-weight: 600;
  color: $v3-text;
  white-space: nowrap;
  letter-spacing: 0.01em;
}

.v3-header__filters {
  display: flex;
  align-items: center;
  gap: $v3-space-sm;
  flex: 1;
  min-width: 0;
}

.v3-header__select,
.v3-header__date {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: $v3-control-bg;
  border: 1px solid $v3-control-border;
  border-radius: $v3-radius-md;
  cursor: pointer;
  transition: background $v3-transition, border-color $v3-transition;

  select,
  input {
    background: transparent;
    border: none;
    font-family: inherit;
    font-size: 13px;
    color: $v3-text;
    cursor: pointer;
    outline: none;
    font-variant-numeric: tabular-nums;

    &::-webkit-calendar-picker-indicator {
      display: none;
    }
  }

  select {
    appearance: none;
    padding-right: 16px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239aa8ba' stroke-width='1.2' fill='none'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right center;
  }

  &:hover {
    background: $v3-control-bg-hover;
    border-color: $v3-control-border-hover;
  }

  &:focus-within {
    background: $v3-control-bg-hover;
    border-color: $v3-control-focus-border;
    box-shadow: 0 0 0 1px $v3-control-focus-glow;
  }
}

.v3-header__date-icon {
  width: 14px;
  height: 14px;
  color: $v3-text-secondary;
  flex-shrink: 0;
}

.v3-header__actions {
  display: flex;
  align-items: center;
  gap: $v3-space-md;
  flex-shrink: 0;
}

.v3-header__live {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $v3-space-sm;
  flex-shrink: 0;
}

.v3-header__time {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: $v3-text-secondary;
  white-space: nowrap;
}

.v3-header__live-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  font-size: 11px;
  color: $v3-neon-green;
  background: $v3-neon-green-soft;
  border: 1px solid $v3-neon-green-border;
  border-radius: 12px;
}

.v3-header__live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $v3-neon-green;
  box-shadow: 0 0 6px $v3-neon-green;
  animation: live-pulse 2s ease-in-out infinite;
}

@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.v3-header__search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  background: $v3-control-bg;
  border: 1px solid $v3-control-border;
  border-radius: 20px;
  min-width: 220px;
  transition: background $v3-transition, border-color $v3-transition, box-shadow $v3-transition;

  svg {
    width: 14px;
    height: 14px;
    color: $v3-text-secondary;
    flex-shrink: 0;
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    font-family: inherit;
    font-size: 13px;
    color: $v3-text;
    outline: none;
    min-width: 0;

    &::placeholder {
      color: $v3-text-muted;
    }
  }

  &:hover {
    background: $v3-control-bg-hover;
    border-color: $v3-control-border-hover;
  }

  &:focus-within {
    background: $v3-control-bg-hover;
    border-color: $v3-control-focus-border;
    box-shadow: 0 0 0 1px $v3-control-focus-glow;
  }
}

.v3-header__icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: $v3-control-bg;
  border: 1px solid $v3-control-border;
  border-radius: $v3-radius-md;
  color: $v3-text-secondary;
  cursor: pointer;
  transition: background $v3-transition, border-color $v3-transition, color $v3-transition, box-shadow $v3-transition;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: $v3-control-bg-hover;
    border-color: $v3-control-border-hover;
    color: $v3-text;
  }

  &:focus-visible {
    outline: none;
    border-color: $v3-control-focus-border;
    box-shadow: 0 0 0 1px $v3-control-focus-glow;
  }
}
</style>
