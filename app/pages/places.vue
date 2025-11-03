<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'

definePageMeta({
  middleware: 'auth',
})

const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')

const rowSelection = ref({})
const { deletePlace } = useDeletePlace()

interface Place {
  id: number
  name: string
  description: string
  tags: Array<string>
  lat: number,
  lng: number
}


const { data, status } = await useFetch<Place[]>('/api/places', {
  lazy: true
})

function getRowItems(row: Row<Place>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'View place details',
      icon: 'i-lucide-list',
      onSelect: () => navigateTo('/place/' + row.original.id)
    },
    {
      label: 'View on map',
      icon: 'i-lucide-map',
      onSelect: () => navigateTo(`/map?lat=${row.original.lat}&lng=${row.original.lng})}`)
    },
    {
      type: 'separator'
    },
    {
      label: 'Delete place',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        deletePlace({
          id: row.original.id,
          onDeleted: () => {
            data.value = data.value?.filter(p => p.id !== row.original.id)
          }
        });
      },
    }
  ]
}

const columns: TableColumn<Place>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'ariaLabel': 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'ariaLabel': 'Select row'
      })
  },
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return h('p', { class: 'font-medium text-highlighted' }, row.original.name)
    }
  },
  {
    accessorKey: 'description',
    header: ({ column }) => {
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Description',
        class: '-mx-2.5',
      })
    },
    meta: {class: {td: 'max-w-sm overflow-hidden'}}
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    filterFn: 'equals',
    cell: ({ row }) => {
      const color = {
        subscribed: 'success' as const,
        unsubscribed: 'error' as const,
        bounced: 'warning' as const
      }[row.original.tags] ?? 'success'

      return row.original.tags.map(tag =>
        h(UBadge, { class: 'capitalize mr-2', variant: 'subtle', color }, () => tag)
      )
    }
  },
  {
    header: 'Lat/Lng',
    cell: ({ row }) => {
      return row.original.lat + ', ' + row.original.lng;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row)
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto'
            })
        )
      )
    }
  }
]

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})
</script>

<template>
  <UDashboardPanel id="places">
    <template #header>
      <UDashboardNavbar title="Places">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton to="/place/add" label="Add new place" icon="i-lucide-plus" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <div class="flex flex-wrap items-center gap-1.5">
          <USelect
            :items="[
              { label: 'All', value: 'all' },
              { label: 'Subscribed', value: 'subscribed' },
              { label: 'Unsubscribed', value: 'unsubscribed' },
              { label: 'Bounced', value: 'bounced' }
            ]"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            placeholder="Filter status"
            class="min-w-28"
          />
        </div>
      </div>

      <UTable
        ref="table"
        v-model:row-selection="rowSelection"
        v-model:pagination="pagination"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
        class="shrink-0"
        :data="data"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0'
        }"
      />

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
          {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
        </div>

        <div class="flex items-center gap-1.5">
          <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
