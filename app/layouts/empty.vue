<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const toast = useToast()

const open = ref(false)
</script>

<template>
  <UDashboardGroup unit="rem">
    <slot />
  </UDashboardGroup>
</template>
