<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'
import { placeSchema } from '~/shared/validation/place'
import type {PlaceSchema} from "~/shared/validation/place";

definePageMeta({
  middleware: 'auth',
})

const UButton = resolveComponent('UButton')

const toast = useToast()

const route = useRoute()
const { deletePlace } = useDeletePlace();

const { data: place, status } = await useFetch<Place>('/api/place/' + route.params.id , {
})

const tags = ['Not shot yet', 'Favourites', 'Easy', 'Hiking required', 'Quick shoots']

const form = ref<any>(null)

const state = reactive<Partial<PlaceSchema>>({
  name: '',
  description: '',
  tags: [] as string[],
  lat: 0,
  lng: 0
})

watchEffect(() => {
  if (place.value) {
    state.name = place.value.name
    state.description = place.value.description
    state.tags = [...place.value.tags]
    state.lat = place.value.lat
    state.lng = place.value.lng
  }
})

async function onSubmit(event: FormSubmitEvent<PlaceSchema>) {
  try {
    const result = await $fetch('/api/place/' + route.params.id, {
      method: 'POST',
      body: event.data,
      throw: true
    });
    toast.add({ title: 'Success', description: 'The place was updated', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Failed', description: 'Error saving', color: 'error' })
    // const errs = error.data?.data?.errors;
    //
    // if (Array.isArray(errs) && errs.length) {
    //   form.value?.setErrors(errs.map(e => ({ name: e.path, message: e.message })))
    //   return
    // }
  }
}

const formErrors = ref<{ name: string; message: string }[]>([])
const highlightPlace = useState('highlightPlace', () => null)

const deleteClick = () => {
  deletePlace({
    id: place.id,
    onDeleted: () => {
      navigateTo('/places')
    }
  });
}
</script>

<template>
  <UDashboardPanel id="place">
    <template #header>
      <UDashboardNavbar :title="place?.name || 'Loading…'">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton :to="`/map?lat=${place.lat}&lng=${place.lng}`" label="View on map" icon="i-lucide-map" />
          <UButton to="/place/add" label="Add new place" icon="i-lucide-plus" />
          <UButton :to="`/map?lat=${place.lat}&lng=${place.lng}`" color="error" label="Delete" icon="i-lucide-trash-2" :on-click="deleteClick" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UForm ref="form" :schema="placeSchema" :state="state" class="w-full" @submit="onSubmit" :errors="formErrors">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UFormField label="Name" name="name" class="col-span-1">
            <UInput size="xl" v-model="state.name" class="w-full"/>
          </UFormField>

          <UFormField label="Description" name="description" class="col-start-1 col-span-1">
            <UTextarea size="xl" v-model="state.description" class="w-full"/>
          </UFormField>

          <UFormField label="Tags" name="tags" class="col-start-1 col-span-1">
            <UInputMenu size="xl" v-model="state.tags" multiple :items="tags"  class="w-full"/>
          </UFormField>

          <div class="flex gap-2 col-start-1 col-span-1">
            <UFormField label="Latitude" name="lat" class="w-1/2">
              <UInput size="xl" v-model.number="state.lat" type="number" step="0.000001" class="w-full"/>
            </UFormField>

            <UFormField label="Longitude" name="lng" class="w-1/2">
              <UInput size="xl" v-model.number="state.lng" type="number" step="0.000001" class="w-full" />
            </UFormField>
          </div>
        </div>
        <UButton class="mt-8" type="submit" icon="i-lucide-save">Save</UButton>
      </UForm>
    </template>
  </UDashboardPanel>
</template>
