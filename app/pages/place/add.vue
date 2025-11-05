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
  lng: route.query.lng,
  images: []
})

async function onSubmit(event: FormSubmitEvent<PlaceSchema>) {
  try {
    const body = {
      ...event.data,
      uploadIds: Object.values(fileIds.value) // add the uploaded file ids
    }

    await $fetch('/api/place', {
      method: 'POST',
      body,
      throw: true
    })
    toast.add({ title: 'Success', description: 'The place was added', color: 'success' })
    navigateTo('/places')
  } catch (error) {
    toast.add({ title: 'Failed', description: 'Error adding', color: 'error' })
  }
}

function createObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}

const files = ref<File[]>([])
const interactive = ref(true);
const progress = ref<Record<string, number>>({})
const uploaded = new WeakSet<File>()
const fileIds = ref<Record<string, string>>({})

watch(() => state.images, async (files, oldFiles) => {
  interactive.value = files.length <= 0;

  const removed = oldFiles.filter(f => !files.includes(f))
  for (const f of removed) {
    const id = fileIds.value[f.name]
    if (!id) {
      continue
    }
    await $fetch(`/api/upload/${id}`, { method: 'DELETE' })
    delete progress.value[f.name]
    delete fileIds.value[f.name]
  }

  for (const file of files) {
    if (uploaded.has(file)) {
      continue
    }

    uploaded.add(file)
    progress.value[file.name] = 0

    uploadFile(file)
  }
})

function uploadFile(file: File) {
  const xhr = new XMLHttpRequest()
  const form = new FormData()
  form.append('file', file)

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      progress.value[file.name] = Math.round((e.loaded / e.total) * 100)
    }
  }

  xhr.onload = () => {
    const { id } = JSON.parse(xhr.responseText)
    fileIds.value[file.name] = id
    progress.value[file.name] = 100
  }

  xhr.open('POST', '/api/upload')
  xhr.send(form)
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
                v-model="state.images"
                :interactive="interactive">

                <template #files-top="{ open, files }">
                  <div v-if="files?.length" class="mb-2 flex items-center justify-end">
                    <UButton
                      icon="i-lucide-plus"
                      label="Add more"
                      color="neutral"
                      variant="outline"
                      class="-my-2"
                      size="sm"
                      @click="open()"
                    />
                  </div>
                </template>

                <template #file-leading="{ file, index, ui }">
                  <UAvatar size="xl" :src="createObjectUrl(file)" class="h-full w-full rounded object-cover" />
                  <div  v-if="progress[file.name] !== undefined && progress[file.name] < 100" class="absolute inset-0 bg-black/40 flex items-center justify-center rounded">
                    <div class="relative w-12 h-12">
                      <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="16" stroke="rgba(255,255,255,0.2)" stroke-width="3" fill="none"/>
                        <circle cx="18" cy="18" r="16" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="100" :stroke-dashoffset="100 - progress[file.name]" class="transition-all duration-200"/>
                      </svg>
                    </div>
                  </div>
                </template>
              </UFileUpload>
            </UFormField>
          </div>
        </div>

        <UButton class="mt-8" type="submit" icon="i-lucide-save">Add</UButton>
      </UForm>
    </template>
  </UDashboardPanel>
</template>
