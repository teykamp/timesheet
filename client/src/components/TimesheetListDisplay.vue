<template>
  <v-card
    flat 
    :class="`mt-6 ${xs ? '' : 'px-12'}`"
  >
    <div class="flex flex-col sm:flex-row justify-space-between align-center">
      <v-card flat>
        <template v-slot:title>
          View Timesheets
        </template>
      </v-card>
      <v-card flat>
        <template v-slot:text>
          <v-text-field
            v-model="search"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            single-line
            variant="outlined"
            hide-details
            style="max-width: 400px; min-width: 250px;"
          ></v-text-field>
        </template>
      </v-card>
    </div>
    <div style="max-height: calc(95vh - 190px); overflow-y: auto;">
      <v-data-table
        :items="items"
        :items-per-page="-1"
        :headers="headerData"
        :search="search"
        >
        <template v-slot:item.status="{ item }">
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
      
        <template v-slot:item.view="{ item }">
          <v-btn
            flat
            size="small"
            prepend-icon="mdi-eye"
          >View</v-btn>
        </template>
      
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end">
            <v-btn
              @click="editTimesheet(item)"
              icon="mdi-pencil"
              class="mr-1"
              variant="tonal"
              size="small"
              :disabled="item.status === 'approved'"
            ></v-btn>
            <v-btn
              @click="deleteTimesheet(item)"
              icon="mdi-delete"
              class="ml-1"
              variant="tonal"
              size="small"
              color="red"
              :disabled="item.status === 'approved'"
            ></v-btn>
          </div>
        </template>
        <template v-slot:bottom></template>
      </v-data-table>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

const { xs } = useDisplay()

type Item = {
  endDate: String,
  totalHoursWorked: Number,
  status: 'working' | 'submitted' | 'approved'
}

const getStatusChipColor = (status: Item['status']) => {
  switch (status) {
    case 'working':
      return 'primary'
    case 'submitted':
      return 'orange'
    case 'approved':
      return 'success'
  }
}

const deleteTimesheet = (item: Item) => {
  return
}

const editTimesheet = (item: Item) => {
  return
}

const search = ref('')

const headerData = ref([
  {
    title: 'End Date',
    key: 'endDate',
  },
  { 
    title: 'Hours', 
    key: 'totalHoursWorked',
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
],)

const items = ref([
  {
    endDate: '12/11/23',
    totalHoursWorked: 50,
    status: 'approved',
  },
  {
    endDate: '4/18/22',
    totalHoursWorked: 29,
    status: 'approved',
  },
  {
    endDate: '9/1/21',
    totalHoursWorked: 40,
    status: 'approved',
  },
  {
    endDate: '9/18/23',
    totalHoursWorked: 40,
    status: 'approved',
  },
  {
    endDate: '2/29/00',
    totalHoursWorked: 40,
    status: 'working',
  },
  {
    endDate: '12/11/23',
    totalHoursWorked: 50,
    status: 'submitted',
  },
  {
    endDate: '4/18/22',
    totalHoursWorked: 29,
    status: 'submitted',
  },
  {
    endDate: '9/1/21',
    totalHoursWorked: 40,
    status: 'submitted',
  },
  {
    endDate: '9/18/23',
    totalHoursWorked: 40,
    status: 'submitted',
  },
  {
    endDate: '2/29/00',
    totalHoursWorked: 40,
    status: 'working',
  },
  {
    endDate: '12/11/23',
    totalHoursWorked: 50,
    status: 'working',
  },
  {
    endDate: '4/18/22',
    totalHoursWorked: 29,
    status: 'working',
  },
  {
    endDate: '9/1/21',
    totalHoursWorked: 40,
    status: 'working',
  },
  {
    endDate: '9/18/23',
    totalHoursWorked: 40,
    status: 'working',
  },
  {
    endDate: '2/29/00',
    totalHoursWorked: 40,
    status: 'working',
  },
])
</script>