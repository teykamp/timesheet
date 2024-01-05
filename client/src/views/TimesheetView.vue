<template>
  <div>
    <IsUserLoggedInWrapper>
      <template #contentIfLoggedIn>
        <div v-if="timesheetViewState === 'allTimesheets'">
          <TimesheetListDisplay
            :updateState="updateTimesheetViewState"
            :viewTimesheet="viewTimesheet"
            :timesheetListDisplayActions="timesheetListDisplayActions"
            :fetchData="getUserTimesheets"
            :userTimesheets="userTimesheets"
            :headerData="timesheetHeaderData"
          />
          <v-container 
            v-if="!isTimesheetListLoading"
            class="d-flex justify-end"
          >
            <v-btn
              @click="handleAddNewTimesheet()"
              prepend-icon="mdi-plus"
            >
              New
            </v-btn>
          </v-container>
        </div>
        <v-btn
          v-if="timesheetViewState === 'singleTimesheet'"
          @click="updateTimesheetViewState('allTimesheets')"
          icon="mdi-chevron-left"
          flat
          class="position-absolute ml-4 mt-2"
        ></v-btn>
        <EditTimesheet
          v-if="timesheetViewState === 'singleTimesheet'"
          :updateState="updateTimesheetViewState"
        />
      </template>
    </IsUserLoggedInWrapper>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useHandleTimesheetDisplay } from '../stores/useDataStore'
import { useLoadingScreen } from '../stores/useUserInterfaceStore'
import type { Timesheet } from '../stores/types'
import { useGoogleUserData } from '../stores/useDataStore'
import { timesheetHeaderData } from '../functions/headerData'


import EditTimesheet from '../components/EditTimesheet.vue'
import TimesheetListDisplay from '../components/TimesheetListDisplay.vue'
import IsUserLoggedInWrapper from '../components/IsUserLoggedInWrapper.vue'

const useLoadingScreenStore = useLoadingScreen()
const { isTimesheetListLoading } = storeToRefs(useLoadingScreenStore)
const { resetTimesheetDisplay, setTimesheetDisplayStatus, setCurrentTimesheet, updateTimesheetViewState } = useHandleTimesheetDisplay()
const useTimesheetStateStore = useHandleTimesheetDisplay()
const { timesheetViewState } = storeToRefs(useTimesheetStateStore)
const { id, isUserLoggedIn } = useGoogleUserData()
const { setLoadingState } = useLoadingScreen()

const handleAddNewTimesheet = () => {
  resetTimesheetDisplay()
  setTimesheetDisplayStatus('new')
  updateTimesheetViewState('singleTimesheet')
}

const userTimesheets = ref<Timesheet[]>([])

const timesheetListDisplayActions = ref({
  editTimesheet: {
    callback: (timesheet: Timesheet) => {
      setTimesheetDisplayStatus('edit')
      setCurrentTimesheet(timesheet.timesheetid)
      updateTimesheetViewState('singleTimesheet')
    },
    icon: 'mdi-pencil',
    color: '',
    disabled: (timesheet: Timesheet) => timesheet.status === 'approved'
  },
  
  deleteTimesheet: {
    callback: async (timesheetToDelete: Timesheet) => {
      try {
        const response = await axios.delete(`/api/timesheets/${timesheetToDelete.timesheetid}`)

        if (response.status === 200) {
          const updatedTimesheets = userTimesheets.value.filter(timesheet => timesheet.timesheetid !== timesheetToDelete.timesheetid)
          userTimesheets.value = updatedTimesheets
        } else {
          console.error('Failed to delete timesheet:', response.data.error)
        }
      } catch (error) {
        console.error('Error deleting timesheet:', error)
      }
    },
    icon: 'mdi-delete',
    color: 'red',
    disabled: (timesheet: Timesheet) => timesheet.status === 'approved'
  },
})

const viewTimesheet = (timesheet: Timesheet) => {
  setTimesheetDisplayStatus('view')
  setCurrentTimesheet(timesheet.timesheetid)
  updateTimesheetViewState('singleTimesheet')
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
</script>