<script setup lang="ts">
interface Coords {
  lat: number
  lng: number
}

defineProps<{
  coords: Coords,
  withLabel?: boolean
}>()
</script>

<template>
  <div class="flex gap-2 items-center">
    <span v-if="withLabel" class="text-xs text-muted">Coords: </span>
    <UBadge color="primary" variant="outline">{{coords.lat.toFixed(6)}}</UBadge>
    <UBadge color="primary" variant="outline">{{coords.lng.toFixed(6)}}</UBadge>
  </div>
</template>
