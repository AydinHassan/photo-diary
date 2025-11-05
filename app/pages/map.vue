<script setup lang="ts">
import { ref, onMounted } from 'vue'
import 'leaflet/dist/leaflet.css';
import {type PlaceSchema, placeSchema} from "~/shared/validation/place";

const places = ref<Place[]>([])
const types = ['All', 'Not shot yet', 'Favourites', 'Easy', 'Hiking required', 'Quick shoots']
const type = ref('All');
const rightClickLatLng = ref(null);
const map = ref(null);
const selectedPlace = ref(null);
const placeModalOpen = ref(false);
const route = useRoute()
const router = useRouter()
const { deletePlace } = useDeletePlace();
const tags = ['Not shot yet', 'Favourites', 'Easy', 'Hiking required', 'Quick shoots']
const form = useTemplateRef('form')
const toast = useToast()

definePageMeta({
  middleware: 'auth',
})

const defaultView = { center: [47.5162, 14.55], zoom: 7 }

const targetView = computed(() => {
  const lat = parseFloat(route.query.lat)
  const lng = parseFloat(route.query.lng)
  if (isNaN(lat) || isNaN(lng)) {
    return defaultView
  }
  return { center: [lat, lng], zoom: 13 }
})

watch(
  [map, targetView],
  ([map, view]) => {
    if (!map) {
      return
    }
    map.setView(view.center, view.zoom)
  },
  { immediate: true }
)

function resetMap() {
  router.replace({ path: route.path, query: {} })
}
const mails = []

let activeMarker = ref(null);
const markers = new Map<number, L.Marker>()

onMounted(async () => {
  const L = await import('leaflet')
  map.value = L.map('map')//.setView([47.5162, 14.5501], 7)
  map.value.locate({setView: true, maxZoom: 16});

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value)

  const pinIcon =  L.divIcon({
    html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  fill="currentColor">\n' +
      '  <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />\n' +
      '</svg>',
    iconSize: [35, 35],
    className: 'text-slate-700'
  });

  places.value = await $fetch('/api/places')

  const filteredPlaces = computed(() => {
    if (type.value === 'All') return places.value
    return places.value.filter(p => Array.isArray(p.tags) && p.tags.includes(type.value))
  })

  watchEffect(() => {
    // Add markers for filtered places not yet on the map
    for (const place of filteredPlaces.value) {
      if (!place.lat || !place.lng) continue
      if (markers.has(place.id)) continue

      const marker = L.marker([place.lat, place.lng], { icon: pinIcon }).addTo(map.value)
      markers.set(place.id, marker)

      marker.on('click', () => {
        if (activeMarker.value) {
          activeMarker.value.getElement()?.classList.replace('text-green-500', 'text-slate-700')
        }
        activeMarker.value = marker
        selectedPlace.value = place
        placeModalOpen.value = true
        marker.getElement()?.classList.replace('text-slate-700', 'text-green-500')
      })
    }

    // Remove markers for places that are no longer in filtered results or were deleted
    const filteredIds = new Set(filteredPlaces.value.map(p => p.id))
    for (const [id, marker] of markers.entries()) {
      if (!filteredIds.has(id)) {
        // If we are closing a currently selected place because it got filtered out
        if (selectedPlace.value && selectedPlace.value.id === id) {
          activeMarker.value?.getElement()?.classList.replace('text-green-500', 'text-slate-700')
          selectedPlace.value = null
        }
        marker.remove()
        markers.delete(id)
      }
    }
  })

  map.value.on('contextmenu', (e) => {
    rightClickLatLng.value = e.latlng
  })
})

const items = [[{
  label: 'Add place',
  icon: 'i-lucide-send',
  to: '/place/add'
}, {
  label: 'New customer',
  icon: 'i-lucide-user-plus',
  to: '/customers'
}]] satisfies DropdownMenuItem[][]

const addPlaceModalOpen = ref(false)
const addPlaceSubmitting = ref(false)

const state = reactive<Partial<PlaceSchema>>({
  name: '',
  description: '',
  tags: [] as string[],
})

async function onSubmit(event: FormSubmitEvent<PlaceSchema>) {
  try {
    const result = await $fetch('/api/place', {
      method: 'POST',
      body: event.data,
      throw: true
    })

    places.value = await $fetch('/api/places');
    selectedPlace.value = places.value.find(p => p.id === result.id)

    toast.add({ title: 'Success', description: 'The place was added', color: 'success' })
    addPlaceModalOpen.value = false

    state.name = '';
    state.description = '';
    state.tags = [];
  } catch (error) {
    toast.add({ title: 'Failed', description: 'Error adding' + error, color: 'error' })
  } finally {
    addPlaceSubmitting.value = false
  }
}

const contextItems = ref([
  [
    {
      label: 'Add new place',
      icon: 'i-lucide-circle-plus',
      onSelect: () => {
        if (!rightClickLatLng.value) return
        addPlaceModalOpen.value = true

        state.lat = rightClickLatLng.value.lat
        state.lng = rightClickLatLng.value.lng
      }
    }
  ],
  [
    {
      label: 'Show Sidebar',
      kbds: ['meta', 's']
    },
    {
      label: 'Show Toolbar',
      kbds: ['shift', 'meta', 'd']
    },
  ],
  [
    {
      label: 'Refresh the Page'
    },
    {
      label: 'Clear Cookies and Refresh'
    },
    {
      label: 'Clear Cache and Refresh'
    },
  ]
])

const placeActions = [
    {
      label: 'View place',
      icon: 'i-lucide-pencil',
      onSelect: () => {
        navigateTo(`/place/${selectedPlace.value.id}`)
      }
    },
    {
      label: 'View on Google Maps',
      icon: 'i-lucide-map',
      target: '_blank',
      onSelect: () => {
        navigateTo(`https://www.google.com/maps/search/?api=1&query=${selectedPlace.value.lat},${selectedPlace.value.lng}`, { external: true, open: {target:"_blank"} })
      }
    },
    {
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      color: 'red',
      onSelect: () => deleteClick()
    }
  ];

const closeSelectedPlace = () => {
  activeMarker.value.getElement()?.classList.replace('text-green-500', 'text-slate-700')
  selectedPlace.value = null;
}

const deleteClick = () => {
  deletePlace({
    id: selectedPlace.value.id,
    onDeleted: () => {
      places.value = places.value?.filter(p => p.id !== selectedPlace.value.id)

      selectedPlace.value = null;
    }
  });
}
</script>

<template>
  <UDashboardPanel v-if="selectedPlace !== null" id="map"
                   :default-size="20"
                   :min-size="10"
                   :max-size="30"
                    resizable>
    <template #header>
      <UDashboardNavbar :title="selectedPlace?.name ?? null" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton :on-click="closeSelectedPlace" icon="i-lucide-x" size="md" class="rounded-full" />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <p class="text-sm text-wrap break-words">{{selectedPlace.description}}</p>

      <div v-if="selectedPlace.tags.length" class="flex gap-2 flex-wrap">
        <UBadge v-for="tag in selectedPlace.tags" size="md" color="success" variant="outline">{{ tag }}</UBadge>
      </div>

      <div v-if="selectedPlace.images.length" class="grid grid-cols-3 gap-2">
        <template :key="img.id" v-for="img in selectedPlace.images">
          <GalleryImage :img="img" hide-delete></GalleryImage>
        </template>
      </div>

      <UNavigationMenu
        variant="pill"
        :items="placeActions"
        orientation="vertical"
        tooltip
        popover
      />
    </template>
  </UDashboardPanel>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Map" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse v-if="selectedPlace === null"/>
        </template>
        <template #right>
          <UButton :on-click="resetMap" label="Reset zoom" icon="i-lucide-map" />
          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <USelect
            v-model="type"
            :items="types"
            variant="ghost"
            class="-ms-1 data-[state=open]:bg-elevated w-[200px]"
            :ui="{ value: 'capitalize', itemLabel: 'capitalize', trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
          />
        </template>
      </UDashboardToolbar>
    </template>
    <template #body>
      <UContextMenu :items="contextItems">
        <div id="map" class="w-full h-full"></div>
      </UContextMenu>

      <UModal v-model:open="addPlaceModalOpen" title="Add new place here" :ui="{ footer: 'justify-end' }">
        <template #body>
          <UForm ref="form" id="add-place-map-form" :schema="placeSchema" :state="state" class="w-full" @submit="onSubmit">
            <div class="space-y-4 p-2">
              <UFormField label="Name" name="name">
                <UInput size="xl" v-model="state.name" class="w-full"/>
              </UFormField>
              <UFormField label="Description" name="description">
                <UTextarea size="xl" v-model="state.description" class="w-full"/>
              </UFormField>
              <UFormField label="Tags" name="tags">
                <UInputMenu size="xl" v-model="state.tags" multiple :items="tags"  class="w-full"/>
              </UFormField>
              <div class="text-xs text-muted">
                Coords: {{ rightClickLatLng?.lat?.toFixed?.(5) }}, {{ rightClickLatLng?.lng?.toFixed?.(5) }}
              </div>
            </div>
          </UForm>
        </template>
        <template #footer="{ close }">
          <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
          <UButton form="add-place-map-form" icon="i-lucide-save" @click="form.submit()">Save</UButton>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
