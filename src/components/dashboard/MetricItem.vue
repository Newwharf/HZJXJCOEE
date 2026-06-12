<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  unit?: string
  highlight?: boolean
}>()
</script>

<template>
  <div class="metric-item" :class="{ 'metric-item--highlight': highlight }">
    <div class="metric-item__label">{{ label }}</div>
    <div class="metric-item__value">
      <span class="metric-item__number">{{ value }}</span>
      <span v-if="unit" class="metric-item__unit">{{ unit }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.metric-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(0, 40, 80, 0.35);
  border: 1px solid rgba(0, 212, 255, 0.12);
  border-radius: 4px;
  transition: border-color 0.2s;

  &:hover {
    border-color: rgba(0, 212, 255, 0.3);
  }

  &--highlight {
    background: rgba(0, 102, 255, 0.15);
    border-color: rgba(0, 212, 255, 0.35);
  }
}

.metric-item__label {
  font-size: 13px;
  color: rgba(232, 244, 255, 0.7);
}

.metric-item__value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.metric-item__number {
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #00d4ff;
}

.metric-item--highlight .metric-item__number {
  font-size: 26px;
  background: linear-gradient(90deg, #00d4ff, #00ffcc);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.metric-item__unit {
  font-size: 12px;
  color: rgba(232, 244, 255, 0.5);
}
</style>
