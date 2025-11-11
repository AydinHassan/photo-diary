import { useToast } from '#imports'

export function useUpdatePlace() {
  const toast = useToast()

  async function updatePlace(id: number, place: Place) {
    try {
      const result = await $fetch('/api/place/' + id, {
        method: 'POST',
        body: {
          name: place.name,
          description: place.description,
          tags: place.tags,
          lat: place.lat,
          lng: place.lng,
        },
        throw: true
      });

      toast.add({
        title: 'Place updated',
        description: 'The place has been updated.'
      })
    } catch (error) {
      toast.add({ title: 'Failed', description: 'Error saving', color: 'error' })
    }
  }

  return { updatePlace }
}
