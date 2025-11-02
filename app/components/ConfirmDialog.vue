<script setup lang="ts">
import { computed } from 'vue'
import { useConfirm } from '~/composables/useConfirm'

const { confirming, params, confirm, cancel } = useConfirm()

const show = computed({
  get: () => confirming.value,
  set: (val) => (confirming.value = val)
})
</script>

<template>
  <UModal v-model:open="show" :title="params.title" :description="params.message" :ui="{ footer: 'justify-end' }">
    <template #footer="{ close }">
      <UButton :label="params.cancelLabel" color="neutral" variant="outline" @click="cancel" />
      <UButton :label="params.confirmLabel" color="error" @click="confirm"/>
    </template>
  </UModal>
</template>
