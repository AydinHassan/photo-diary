import { useConfirm } from '~/composables/useConfirm'
import { useToast } from '#imports'

export function useDeletePlace() {
  const { openConfirm } = useConfirm()
  const toast = useToast()

  function deletePlace(options: {
    id: number
    onDeleted?: () => void
  }) {
    openConfirm({
      title: 'Delete location',
      message: 'Are you sure you want to delete this location?',
      onConfirm: async () => {
        await $fetch(`/api/place/${options.id}`, { method: 'DELETE' })
        options.onDeleted?.()
        toast.add({
          title: 'Place deleted',
          description: 'The place has been deleted.'
        })
      }
    })
  }

  return { deletePlace }
}
