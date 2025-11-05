<script setup lang="ts">

const props = withDefaults(defineProps<{
  img: { key: string; id: number }
  hideDelete?: boolean
}>(), {
  hideDelete: false
})

const showPreviewModal = ref<boolean>(false)

const emit = defineEmits<{
  (e: 'deleted', id: number): void
}>()

const { deleteImage } = useDeleteImage()

const deletePlaceImage = async () => {
  await deleteImage({
    id: props.img.id,
    onDeleted: async () => {
      emit('deleted', props.img.id)
    }
  });
}
</script>

<template>
  <div class="relative group">
    <img
      :src="`/uploads/${img.key}`"
      class="rounded object-cover w-full"
      @click="showPreviewModal = true"
    />

    <UButton
      v-if="!hideDelete"
      icon="i-lucide-circle-x"
      size="xs"
      variant="ghost"
      color="error"
      class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
      @click.stop="deletePlaceImage"
    />
  </div>

  <UModal v-model:open="showPreviewModal" :content="{ class: 'rounded-none ring-0' }">
    <template #content>
      <NuxtImg
        :src="`/uploads/${img.key}`"
        class="object-contain"
        loading="lazy"
      />
    </template>
  </UModal>
</template>
