<script setup lang="ts">
import { computed } from 'vue'
import { useScreenScale } from '@/composables/useScreenScale'
import '@/styles/dashboard-v2/index.scss'

const { designWidth, designHeight, scale } = useScreenScale()

const wrapperStyle = computed(() => ({
  width: `${designWidth}px`,
  height: `${designHeight}px`,
  transform: `translate(-50%, -50%) scale(${scale.value})`,
}))
</script>

<template>
  <div class="dashboard-v2-screen">
    <div class="dashboard-v2-scale" :style="wrapperStyle">
      <slot />
    </div>
  </div>
</template>
