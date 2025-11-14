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

const { data: fetchedPlace } = await useFetch<Place>('/api/place/' + route.params.id)
const place = reactive(fetchedPlace.value!)

const tags = ['Not shot yet', 'Favourites', 'Easy', 'Hiking required', 'Quick shoots']

const form = ref<any>(null)
const {updatePlace} = useUpdatePlace()

const state = reactive<Partial<PlaceSchema>>({
  name: '',
  description: '',
  tags: [] as string[],
  lat: 0,
  lng: 0
})

watchEffect(() => {
  if (place) {
    state.name = place.name
    state.description = place.description
    state.tags = [...place.tags]
    state.lat = place.lat
    state.lng = place.lng
  }
})

async function onSubmit(event: FormSubmitEvent<PlaceSchema>) {
  await updatePlace(route.params.id, event.data)
}

const formErrors = ref<{ name: string; message: string }[]>([])

const deleteClick = () => {
  deletePlace({
    id: place.id,
    onDeleted: () => {
      navigateTo('/places')
    }
  });
}

const dragging = ref(false)

function onDragOver(e: DragEvent) {
  e.preventDefault()
  dragging.value = true
}

function onDragLeave() {
  dragging.value = false
}

function onDropFiles(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (files && files.length) {
    handleFiles(files)
  }
}

const uploading = ref([])

function onSelectFiles(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    handleFiles(input.files)
    input.value = ''
  }
}

function handleFiles(list: FileList) {
  for (const file of Array.from(list)) {
    if (uploading.value.some(u => u.file === file)) continue

    const item = reactive({
      file,
      preview: URL.createObjectURL(file),
      progress: 0
    })

    uploading.value.push(item)
    uploadFile(item)
  }
}

async function uploadFile(item) {
  const xhr = new XMLHttpRequest()
  const form = new FormData()
  form.append('file', item.file)

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      item.progress = Math.round((e.loaded / e.total) * 100)
    }
  }

  xhr.onload = () => {
    try {
      const res = JSON.parse(xhr.responseText)
      if (res.image) {
        item.progress = 100

        uploading.value = uploading.value.filter(u => u !== item)
        place.images.unshift(res.image)
      }
    } catch (err) {
      console.error('Invalid upload response:', xhr.responseText)
    }
  }

  xhr.onerror = () => {
    console.error('Upload failed:', item.file.name)
  }

  xhr.open('POST', `/api/place/${place.id}/upload`)
  xhr.send(form)
}


const items = ref<DropdownMenuItem[]>([
  [
    {
      label: 'View on map',
      icon: 'i-lucide-map',
      to: `/?lat=${place.lat}&lng=${place.lng}`
    },
    {
      label: 'View on Google Maps',
      icon: 'i-lucide-map-pin',
      to: `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`,
      target: '_blank'
    }
  ],
  [
    {
      color: "success",
      label: 'Add new place',
      icon: 'i-lucide-plus',
      to: '/place/add'
    }
  ],
  [
    {
      color: "error",
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      onSelect: () => deleteClick()
    },
  ]

])
</script>

<template>
  <UDashboardPanel id="place">
    <template #header>
      <UDashboardNavbar :title="place?.name || 'Loading…'">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-menu" color="neutral" variant="outline" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UForm ref="form" :schema="placeSchema" :state="state" class="w-full" @submit="onSubmit" :errors="formErrors">
        <div class="flex w-full gap-4">
          <div class="flex flex-col w-full lg:w-1/2 gap-4">
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
          <div class="flex flex-col w-full  lg:w-1/2 gap-4">
            <div class="grid grid-cols-3 gap-2 mt-6">
              <label class="aspect-square flex items-center justify-center rounded-md cursor-pointer border border-dashed border-success bg-default hover:bg-elevated/25 transition-[background]"
                   :class="dragging ? 'bg-elevated/25' : ''"
                   @drop.prevent="onDropFiles"
                   @dragover="onDragOver"
                   @dragleave="onDragLeave"
                >
                <input type="file" accept="image/*" multiple class="hidden" @change="onSelectFiles" />
                <span class="inline-flex items-center justify-center select-none rounded-full align-middle bg-elevated size-8">
                    <UIcon name="i-lucide-plus" class="size-5 text-muted" />
                </span>
              </label>
              <div
                v-for="(item, i) in uploading"
                :key="'upload-' + i"
                class="aspect-square relative rounded overflow-hidden"
              >
                <img :src="item.preview" class="object-cover w-full h-full" />
                <div  v-if="item.progress < 100" class="absolute inset-0 bg-black/40 flex items-center justify-center rounded">
                  <div class="relative w-12 h-12">
                    <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="16" stroke="rgba(255,255,255,0.2)" stroke-width="3" fill="none"/>
                      <circle cx="18" cy="18" r="16" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="100" :stroke-dashoffset="100 - item.progress" class="transition-all duration-200"/>
                    </svg>
                  </div>
                </div>
              </div>
              <GalleryImage v-for="img in place.images" :key="img.id" :img="img" @deleted="place.images = place.images.filter(i => i.id !== $event)"></GalleryImage>
            </div>
          </div>
        </div>
        <UButton class="mt-8" type="submit" icon="i-lucide-save">Save</UButton>
      </UForm>
    </template>
  </UDashboardPanel>
</template>
