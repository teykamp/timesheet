<template>
  <v-card
    flat 
    :class="`mt-6 ${xs ? '' : 'px-12'}`"
  >
    <div 
      v-if="isTimesheetListLoading"
      style="height: 500px; width: 100%"
      class="d-flex align-center justify-center"
    >
      <v-progress-circular 
        indeterminate 
        :size="57"
      ></v-progress-circular>
    </div>
    <div v-else>
      <div  
        class="flex flex-col sm:flex-row justify-space-between align-center"
      >
        <v-card flat>
          <template v-slot:title>
            View Timesheets
          </template>
        </v-card>
        <v-card flat>
          <template #text>
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
      <div style="max-height: calc(88vh - 210px); overflow-y: auto;">
        <v-data-table
          :items="userTimesheets"
          :items-per-page="-1"
          :headers="headerData"
          :search="search"
          >
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
          <template #bottom></template>
        </v-data-table>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import axios from 'axios'

import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'

import { useGoogleUserData } from '../stores/useDataStore'
import { useHandleTimesheetDisplay } from '../stores/useDataStore'
import { useLoadingScreen } from '../stores/useUserInterfaceStore'
import type { TimesheetStateTypes } from '../stores/useDataStore'

import { formatDateToDDMMYY } from '../functions/dateUtils'

const { id, isUserLoggedIn } = useGoogleUserData()
const { setCurrentTimesheet, setTimesheetDisplayStatus } = useHandleTimesheetDisplay()
const { setLoadingState } = useLoadingScreen()
const useLoadingScreenStore = useLoadingScreen()
const { isTimesheetListLoading } = storeToRefs(useLoadingScreenStore)

const { xs } = useDisplay()

const props = defineProps<{
  updateState: (newState: TimesheetStateTypes) => void,
}>()

type Item = {
  timesheetid: number,
  enddate: string,
  totalHours: number,
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
const userTimesheets = ref<Item[]>([])

const deleteTimesheet = async (item: Item) => {
  try {
    const response = await axios.delete(`/api/timesheets/${item.timesheetid}`)

    if (response.status === 200) {
      const updatedTimesheets = userTimesheets.value.filter(timesheet => timesheet.timesheetid !== item.timesheetid)
      userTimesheets.value = updatedTimesheets
    } else {
      console.error('Failed to delete timesheet:', response.data.error)
    }
  } catch (error) {
    console.error('Error deleting timesheet:', error.message)
  }
}

const editTimesheet = (item: Item) => {
  setTimesheetDisplayStatus('edit')
  setCurrentTimesheet(item.timesheetid)
  props.updateState('editTimesheet')
}

const viewTimesheet = (item: Item) => {
  setTimesheetDisplayStatus('view')
  setCurrentTimesheet(item.timesheetid)
  props.updateState('editTimesheet')
}

const getUserTimesheets = () => {
  if (!isUserLoggedIn()) return
  
  setLoadingState('isTimesheetListLoading', true)
  axios.get(`/api/timesheets/user/${id}`)
    .then(response => {
      const { data } = response
      userTimesheets.value = data.reverse()
      setLoadingState('isTimesheetListLoading', false)
    })
    .catch(error => {
      console.error('Error fetching data:', error.message)
    })
}

getUserTimesheets() // cache this to a store value to remove db calls

const search = ref('')

const headerData = ref([
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
])
</script>