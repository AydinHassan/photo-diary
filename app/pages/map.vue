<script setup lang="ts">
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';

const places = ref([])

onMounted(async () => {
  // fetch your JSON data
  places.value = await fetch('/places.json').then(r => r.json())

  // initialize Leaflet map
  const map = L.map('map').setView([47.5162, 14.5501], 7);

  // add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  // add pins for each place
  places.value.forEach(place => {
    L.marker([place.lat, place.lng])
      .addTo(map)
      .bindPopup(`<strong>${place.name}</strong><br>${place.notes}`)
  })
})

const { isNotificationsSlideoverOpen } = useDashboard()

const items = [[{
  label: 'New mail',
  icon: 'i-lucide-send',
  to: '/inbox'
}, {
  label: 'New customer',
  icon: 'i-lucide-user-plus',
  to: '/customers'
}]] satisfies DropdownMenuItem[][]

// const range = shallowRef<Range>({
//   start: sub(new Date(), { days: 14 }),
//   end: new Date()
// })
// const period = ref<Period>('daily')
</script>

<template>
  <UDashboardPanel id="map">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
<!--          <HomeDateRangePicker v-model="range" class="-ms-1" />-->

<!--          <HomePeriodSelect v-model="period" :range="range" />-->
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
<!--      <HomeStats :period="period" :range="range" />-->
<!--      <HomeChart :period="period" :range="range" />-->
<!--      <HomeSales :period="period" :range="range" />-->

        <div id="map" class="w-full h-full"></div>
    </template>
  </UDashboardPanel>
</template>
