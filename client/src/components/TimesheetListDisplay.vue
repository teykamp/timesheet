<template>
  <v-card 
    flat 
    :class="`mt-6 ${xs ? '' : 'px-12'}`"
  >
    <v-data-table
      :items="items"
      :items-per-page="-1"
      :headers="headerData"
      >
      <template v-slot:item.approved="{ item }">
        <div>
          <v-chip
            :color="item.approved ? 'green' : 'orange'"
            :text="item.approved ? 'Approved' : 'Submitted'"
            class="text-uppercase"
            label
            size="small"
          ></v-chip>
        </div>
      </template>

      <template v-slot:item.view="{ item }">
        <v-btn
          flat
          size="small"
          prepend-icon="mdi-eye"
        >View</v-btn>
      </template>

      <template v-slot:item.actions="{ item }">
        <div class="d-flex justify-end">
          <v-icon
            class="mr-1"
            size="small"
            @click="editTimesheet(item)"
          >mdi-pencil</v-icon>
          <v-icon
            class="ml-1"
            size="small"
            color="red"
            @click="deleteTimesheet(item)"
          >mdi-delete</v-icon>
        </div>
      </template>
      <template v-slot:bottom></template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

const { xs } = useDisplay()

const deleteTimesheet = (item: any) => {
  return
}

const editTimesheet = (item: any) => {
  return
}

const headerData = ref([
  {
    title: 'EndDate',
    key: 'endDate',
  },
  { 
    title: 'Hours', 
    key: 'totalHoursWorked',
  },
  { 
    title: 'Status',
    key: 'approved',
  },
  {
    title: '',
    key: 'view',
    align: 'center',
    sortable: false,
  },
  { 
    title: 'Actions',
    key: 'actions',
    align: 'end',
    sortable: false,
  },
],)

const items = ref([
  {
    endDate: '12/11/23',
    totalHoursWorked: 50,
    approved: true,
  },
  {
    endDate: '4/18/22',
    totalHoursWorked: 29,
    approved: false,
  },
  {
    endDate: '9/1/21',
    totalHoursWorked: 40,
    approved: true,
  },
  {
    endDate: '9/18/23',
    totalHoursWorked: 40,
    approved: true,
  },
  {
    endDate: '2/29/00',
    totalHoursWorked: 40,
    approved: false,
  },
])
</script>