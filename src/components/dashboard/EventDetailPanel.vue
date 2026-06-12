<script setup lang="ts">
import { computed } from 'vue'
import type { TimelineEventDetail } from '@/types/oee'
import { TIMELINE_COLORS, TIMELINE_LABELS } from '@/constants/timeline'
import { formatDuration } from '@/utils/time'

const props = defineProps<{
  event: TimelineEventDetail | null
}>()

const typeColor = computed(() =>
  props.event ? TIMELINE_COLORS[props.event.type] : '',
)

const typeLabel = computed(() =>
  props.event ? TIMELINE_LABELS[props.event.type] : '',
)
</script>

<template>
  <div class="event-detail" :class="{ 'event-detail--empty': !event }">
    <template v-if="event">
      <div class="event-detail__header">
        <span class="event-detail__badge" :style="{ background: typeColor }">
          {{ typeLabel }}
        </span>
        <span class="event-detail__title">{{ event.title }}</span>
      </div>
      <div class="event-detail__body">
        <div class="event-detail__row">
          <span class="event-detail__key">时间段</span>
          <span class="event-detail__val">{{ event.start }} — {{ event.end }}</span>
        </div>
        <div class="event-detail__row">
          <span class="event-detail__key">持续时长</span>
          <span class="event-detail__val">{{ formatDuration(event.duration) }}</span>
        </div>
        <div v-if="event.product" class="event-detail__row">
          <span class="event-detail__key">加工产品</span>
          <span class="event-detail__val">{{ event.product }}</span>
        </div>
        <div v-if="event.operator" class="event-detail__row">
          <span class="event-detail__key">操作人员</span>
          <span class="event-detail__val">{{ event.operator }}</span>
        </div>
        <div v-if="event.reason" class="event-detail__row">
          <span class="event-detail__key">原因</span>
          <span class="event-detail__val">{{ event.reason }}</span>
        </div>
        <div class="event-detail__row">
          <span class="event-detail__key">详情</span>
          <span class="event-detail__val">{{ event.description }}</span>
        </div>
      </div>
    </template>
    <template v-else>
      <span class="event-detail__placeholder">点击时间轴片段查看事件详情</span>
    </template>
  </div>
</template>

<style scoped lang="scss">
.event-detail {
  padding: 12px 16px;
  background: rgba(0, 30, 60, 0.5);
  border: 1px solid rgba(0, 212, 255, 0.15);
  border-radius: 4px;
  min-height: 120px;
}

.event-detail--empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-detail__placeholder {
  font-size: 13px;
  color: rgba(232, 244, 255, 0.35);
}

.event-detail__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.event-detail__badge {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  color: #0a1628;
}

.event-detail__title {
  font-size: 15px;
  font-weight: 600;
  color: #e8f4ff;
}

.event-detail__body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 20px;
}

.event-detail__row {
  display: flex;
  gap: 8px;
  font-size: 12px;
  line-height: 1.5;
}

.event-detail__key {
  flex-shrink: 0;
  color: rgba(232, 244, 255, 0.45);
  min-width: 56px;
}

.event-detail__val {
  color: rgba(232, 244, 255, 0.85);
}
</style>
