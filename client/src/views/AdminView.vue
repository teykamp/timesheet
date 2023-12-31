<template>
  <v-data-table
    v-if="managerTimesheets.length > 0"
    :items="managerTimesheets"
    :items-per-page="-1"
    :headers="headerData"
    :search="search"
    >
    <template #item.email="{ item }">
      <div>
        {{ item.email }}
      </div>
    </template>
    <template #item.enddate="{ item }">
      <div>
        {{ formatDateToDDMMYY(new Date(item.enddate)) }}
      </div>
    </template>
    <template #item.status="{ item }">
      <div>
        <v-chip
          :color="getStatusChipColor(item.status)"
          :text="item.status"
          class="text-uppercase"
          label
          size="small"
        ></v-chip>
      </div>
    </template>
  
    <template #item.view="{ item }">
      <v-btn
        @click="viewTimesheet(item)"
        flat
        size="small"
        prepend-icon="mdi-eye"
      >View</v-btn>
    </template>
  
    <template #item.actions="{ item }">
      <div class="d-flex justify-end">
        <v-btn
          @click="deleteTimesheet(item)"
          icon="mdi-delete"
          class="mx-1"
          size="small"
          variant="tonal"
          color="red"
          :disabled="item.status === 'approved'"
        ></v-btn>
        <v-btn
          @click="deleteTimesheet(item)"
          icon="mdi-comment"
          class="mx-1"
          size="small"
          variant="tonal"
          :disabled="item.status === 'approved'"
        ></v-btn>
        <v-btn
          @click="deleteTimesheet(item)"
          icon="mdi-file-check-outline"
          class="mx-1"
          size="small"
          variant="tonal"
          color="green"
          :disabled="item.status === 'approved'"
        ></v-btn>
      </div>
    </template>
    <template #bottom></template>
  </v-data-table>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'

import { formatDateToDDMMYY } from '../functions/dateUtils'
// import headerData from '../functions/headerData'

const headerData = [
  {
    title: 'Email',
    key: 'email',
  },
  {
    title: 'End Date',
    key: 'enddate',
  },
  {
    title: 'Hours',
    key: 'totalHours',
  },
  {
    title: 'Status',
    key: 'status',
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
]

const search = ref('')
const managerTimesheets = ref([])

const getStatusChipColor = (status: any) => {
  switch (status) {
    case 'working':
      return 'primary'
    case 'submitted':
      return 'orange'
    case 'approved':
      return 'success'
  }
}

const managerId = '115112513480272962705'

const getStuff = () => {
  axios.get(`/api/timesheets/manager/${managerId}`)
    .then(response => {
      const { data } = response
      managerTimesheets.value = data.reverse()
    })
    .catch(error => {
      console.error('Error fetching data:', error.message)
    })
}

getStuff()
</script>