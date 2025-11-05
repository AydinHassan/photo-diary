import { useConfirm } from '~/composables/useConfirm'
import { useToast } from '#imports'

export function useDeleteImage() {
  const { openConfirm } = useConfirm()
  const toast = useToast()

  function deleteImage(options: {
    id: number
    onDeleted?: () => void
  }) {
    openConfirm({
      title: 'Delete image',
      message: 'Are you sure you want to delete this image from this location?',
      onConfirm: async () => {
        await $fetch(`/api/place/image/${options.id}`, { method: 'DELETE' })
        options.onDeleted?.()
        toast.add({
          title: 'Image deleted',
          description: 'The image has been deleted.'
        })
      }
    })
  }

  return { deleteImage }
}
