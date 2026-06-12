<script setup lang="ts">
import { computed } from 'vue'
import type { EquipmentStatus } from '@/types/oee'
import { EQUIPMENT_STATUS_MAP } from '@/constants/timeline'

const props = defineProps<{
  status: EquipmentStatus
}>()

const statusInfo = computed(() => EQUIPMENT_STATUS_MAP[props.status])
</script>

<template>
  <div class="equipment-status" :style="{ '--status-color': statusInfo.color }">
    <div class="equipment-status__indicator">
      <span class="equipment-status__dot" />
      <span class="equipment-status__pulse" />
    </div>
    <div class="equipment-status__info">
      <span class="equipment-status__label">设备当前状态</span>
      <span class="equipment-status__value">{{ statusInfo.label }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.equipment-status {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: rgba(0, 40, 80, 0.35);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;
}

.equipment-status__indicator {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.equipment-status__dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--status-color);
  box-shadow: 0 0 12px var(--status-color);
}

.equipment-status__pulse {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--status-color);
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.6);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.equipment-status__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.equipment-status__label {
  font-size: 12px;
  color: rgba(232, 244, 255, 0.6);
}

.equipment-status__value {
  font-size: 24px;
  font-weight: 700;
  color: var(--status-color);
}
</style>
