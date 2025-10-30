<script setup lang="ts">
import { ref, onMounted } from 'vue'
import 'leaflet/dist/leaflet.css';

const places = ref([])
const types = ['Not shot yet', 'Favourites', 'Easy', 'Hiking required', 'Quick shoots']
const type = ref(types[1]);
const rightClickLatLng = ref(null);
const map = ref(null);
const selectedPlace = ref(null);
const placeModalOpen = ref(false);
const route = useRoute()
const router = useRouter()

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

onMounted(async () => {
  const L = await import('leaflet')
  map.value = L.map('map').setView([47.5162, 14.5501], 7)

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

  const places = await $fetch('/api/places')

  places.forEach(function (place) {
    if (place.lat && place.lng) {

      let marker = L.marker([place.lat, place.lng], {icon: pinIcon}).addTo(map.value);
      marker.on('click', () => {
        if (activeMarker.value) {
          activeMarker.value.getElement()?.classList.replace('text-green-500', 'text-slate-700')
        }

        activeMarker.value = marker;
        selectedPlace.value = place;
        placeModalOpen.value = true;
        marker.getElement()?.classList.replace('text-slate-700', 'text-green-500')
      })
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

const contextItems = ref([
  [
    {
      label: 'Add new place',
      icon: 'i-lucide-circle-plus',
      onSelect: () => {
        const latlng = rightClickLatLng.value

        navigateTo({
          path: '/place/add',
          query: { lat: latlng.lat, lng: latlng.lng },
        })
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

const closeSelectedPlace = () => {
  activeMarker.value.getElement()?.classList.replace('text-green-500', 'text-slate-700')

  selectedPlace.value = null;
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
      <p class="text-sm">{{selectedPlace.description}}</p>
      <UButton :to="`/place/${selectedPlace.id}`">View place</UButton>
      <div class="flex gap-2 flex-wrap">
        <UBadge v-for="tag in selectedPlace.tags" size="md" color="success" variant="outline">{{ tag }}</UBadge>
      </div>
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
    </template>
  </UDashboardPanel>
</template>
