<script setup lang="ts">
import { ref, onMounted } from 'vue'
import 'leaflet/dist/leaflet.css';

const places = ref([])
const types = ['Not shot yet', 'Favourites', 'Easy', 'Hiking required', 'Quick shoots']
const type = ref(types[1]);
const rightClickLatLng = ref(null);
const map = ref(null);

definePageMeta({
  middleware: 'auth',
})

onMounted(async () => {
  const L = await import('leaflet')
  map.value = L.map('map').setView([47.5162, 14.5501], 7)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value)

  const pins = await $fetch('/api/pins')

  pins.forEach(pin => {
    L.marker([pin.lat, pin.lng]).addTo(map.value)
      .bindPopup(pin.name)
  })

  map.value.on('contextmenu', (e) => {
    rightClickLatLng.value = e.latlng
  })
})

const items = [[{
  label: 'New mail',
  icon: 'i-lucide-send',
  to: '/inbox'
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

        L.marker([latlng.lat, latlng.lng]).addTo(map.value)
          .bindPopup('Test')
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
</script>

<template>
  <UDashboardPanel id="map">
    <template #header>
      <UDashboardNavbar title="Map" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
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
