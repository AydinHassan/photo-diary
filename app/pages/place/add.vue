<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'
import { placeSchema } from '~/shared/validation/place'
import type {PlaceSchema} from "~/shared/validation/place";
const toast = useToast()

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const coords = {
  lat: Number(route.query.lat),
  lng: Number(route.query.lng)
}

const tags = ['Not shot yet', 'Favourites', 'Easy', 'Hiking required', 'Quick shoots']

const state = reactive<Partial<PlaceSchema>>({
  name: '',
  description: '',
  tags: [] as string[],
  lat: route.query.lat,
  lng: route.query.lng
})

async function onSubmit(event: FormSubmitEvent<PlaceSchema>) {
  try {
    const result = await $fetch('/api/place', {
      method: 'POST',
      body: event.data,
      throw: true
    });
    toast.add({ title: 'Success', description: 'The place was added', color: 'success' })
    navigateTo('/places')
  } catch (error) {
    toast.add({ title: 'Failed', description: 'Error adding', color: 'error' })
  }
}
</script>

<template>
  <UDashboardPanel id="add-place">
    <template #header>
      <UDashboardNavbar title="Add new place">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

      </UDashboardNavbar>
    </template>
    <template #body>
      <UForm ref="form" :schema="placeSchema" :state="state" class="w-full" @submit="onSubmit">
        <div class="flex w-full gap-4">
          <div class="flex flex-col w-1/3 gap-4">
            <UFormField label="Name" name="name" class="">
              <UInput size="xl" v-model="state.name" class="w-full"/>
            </UFormField>

            <UFormField label="Description" name="description" class="">
              <UTextarea size="xl" v-model="state.description" class="w-full"/>
            </UFormField>

            <UFormField label="Tags" name="tags" class="">
              <UInputMenu size="xl" v-model="state.tags" multiple :items="tags"  class="w-full"/>
            </UFormField>

            <div class="flex gap-2">
              <UFormField label="Latitude" name="lat" class="w-1/2">
                <UInput size="xl" v-model.number="state.lat" type="number" step="0.000001" class="w-full"/>
              </UFormField>

              <UFormField label="Longitude" name="lng" class="w-1/2">
                <UInput size="xl" v-model.number="state.lng" type="number" step="0.000001" class="w-full" />
              </UFormField>
            </div>
          </div>
          <div class="flex flex-col w-1/3 gap-4">
            <UFormField label="Scout images" name="images" class="">
              <UFileUpload
                multiple
                accept="image/*"
                color="primary"
                icon="i-lucide-image"
                label="Drop your image here"
                description="SVG, PNG, JPG or GIF (max. 2MB)"
                class="col-span-1 min-h-48"
              />
              </UFormField>
          </div>
        </div>

        <UButton class="mt-8" type="submit" icon="i-lucide-save">Add</UButton>
      </UForm>
    </template>
  </UDashboardPanel>
</template>
