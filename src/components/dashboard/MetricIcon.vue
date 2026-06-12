<script setup lang="ts">
export type MetricIconName =
  | 'personnelDuration'
  | 'personnelCount'
  | 'avgFaceTime'
  | 'faceCount'
  | 'avgProdTime'
  | 'prodCount'

defineProps<{
  name: MetricIconName
}>()
</script>

<template>
  <svg
    class="metric-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- lucide:timer -->
    <template v-if="name === 'personnelDuration'">
      <path d="M10 2h4" />
      <path d="M12 14v-4" />
      <path d="m15 11-3 3" />
      <circle cx="12" cy="14" r="8" />
    </template>

    <!-- lucide:bell-ring -->
    <template v-else-if="name === 'personnelCount'">
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M22 8c0-2.3-.8-4.3-2-6" />
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
      <path d="M4 2C2.8 3.7 2 5.7 2 8" />
    </template>

    <!-- lucide:hourglass -->
    <template v-else-if="name === 'avgFaceTime'">
      <path d="M5 22h14" />
      <path d="M5 2h14" />
      <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
      <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
    </template>

    <!-- lucide:flip-horizontal-2 -->
    <template v-else-if="name === 'faceCount'">
      <path d="m3 7 5 5-5 5" />
      <path d="m21 7-5 5 5 5" />
      <path d="M12 20v2" />
      <path d="M12 14v2" />
      <path d="M12 8v2" />
      <path d="M12 2v2" />
    </template>

    <!-- lucide:factory -->
    <template v-else-if="name === 'avgProdTime'">
      <path d="M12 16h.01" />
      <path d="M16 16h.01" />
      <path d="M8 13h.01" />
      <path d="M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
    </template>

    <!-- lucide:arrow-left-right -->
    <template v-else-if="name === 'prodCount'">
      <path d="M8 3 4 7l4 4" />
      <path d="M4 7h16" />
      <path d="m16 21 4-4-4-4" />
      <path d="M20 17H4" />
    </template>
  </svg>
</template>

<style scoped lang="scss">
.metric-icon {
  width: 22px;
  height: 22px;
}
</style>
