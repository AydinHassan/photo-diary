<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'

definePageMeta({
  middleware: 'auth',
})

const UButton = resolveComponent('UButton')

const toast = useToast()

const route = useRoute()

const { data: place, status } = await useFetch<Place>('/api/place/' + route.params.id , {
})

const tags = ['Not shot yet', 'Favourites', 'Easy', 'Hiking required', 'Quick shoots']


const state = reactive({
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

function onSubmit(_e: FormSubmitEvent<any>) {
  console.log('Submitted:', state)
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
          <UButton label="New place" icon="i-lucide-plus" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UForm :state="state" class="w-full" @submit="onSubmit">
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

        <div class="mt-6 flex justify-end">
          <UButton type="submit" icon="i-lucide-save">Save</UButton>
        </div>
      </UForm>
    </template>
  </UDashboardPanel>
</template>
