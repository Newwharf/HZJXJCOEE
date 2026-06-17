<script setup lang="ts">
import { computed } from 'vue'
import { useScreenScale } from '@/composables/useScreenScale'
import { provideDashboardV3Theme } from '@/composables/useDashboardV3Theme'
import '@/styles/dashboard-v3/index.scss'

const { designWidth, designHeight, scale } = useScreenScale()
const { theme } = provideDashboardV3Theme()

const wrapperStyle = computed(() => ({
  width: `${designWidth}px`,
  height: `${designHeight}px`,
  transform: `translate(-50%, -50%) scale(${scale.value})`,
}))
</script>

<template>
  <div class="dashboard-v3-screen" :data-theme="theme">
    <div class="dashboard-v3-scale" :style="wrapperStyle">
      <slot />
    </div>
  </div>
</template>
