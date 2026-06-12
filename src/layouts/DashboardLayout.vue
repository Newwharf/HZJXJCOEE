<script setup lang="ts">
import { computed } from 'vue'
import { useScreenScale } from '@/composables/useScreenScale'

const { designWidth, designHeight, scale } = useScreenScale()

const wrapperStyle = computed(() => ({
  width: `${designWidth}px`,
  height: `${designHeight}px`,
  transform: `translate(-50%, -50%) scale(${scale.value})`,
}))
</script>

<template>
  <div class="screen-container">
    <div class="screen-scale-wrapper" :style="wrapperStyle">
      <slot />
    </div>
  </div>
</template>
