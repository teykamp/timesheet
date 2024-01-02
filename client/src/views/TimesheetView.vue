<template>
  <div>
    <IsUserLoggedInWrapper>
      <template #contentIfLoggedIn>
        <div v-if="state === 'allTimesheets'">
          <TimesheetListDisplay
            :updateState="updateState"
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
          v-if="state === 'editTimesheet'"
          @click="updateState('allTimesheets')"
          icon="mdi-chevron-left"
          flat
          class="position-absolute ml-4 mt-2"
        ></v-btn>
        <EditTimesheet
          v-if="state === 'editTimesheet'"
          :updateState="updateState"
        />
      </template>
    </IsUserLoggedInWrapper>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import type { TimesheetStateTypes } from '../stores/useDataStore'
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
const { resetTimesheetDisplay, setTimesheetDisplayStatus, setCurrentTimesheet } = useHandleTimesheetDisplay()
const { id, isUserLoggedIn } = useGoogleUserData()
const { setLoadingState } = useLoadingScreen()

const state = ref<TimesheetStateTypes>('allTimesheets')

const updateState = (newState: TimesheetStateTypes) => {
  state.value = newState
}

const handleAddNewTimesheet = () => {
  resetTimesheetDisplay()
  setTimesheetDisplayStatus('new')
  updateState('editTimesheet')
  return
}

const userTimesheets = ref<Timesheet[]>([])

const timesheetListDisplayActions = ref({
  editTimesheet: (item: Timesheet) => {
    setTimesheetDisplayStatus('edit')
    setCurrentTimesheet(item.timesheetid)
    updateState('editTimesheet')
  },
  viewTimesheet: (item: Timesheet) => {
    setTimesheetDisplayStatus('view')
    setCurrentTimesheet(item.timesheetid)
    updateState('editTimesheet')
  },
  deleteTimesheet: async (item: Timesheet) => {
    try {
      const response = await axios.delete(`/api/timesheets/${item.timesheetid}`)

      if (response.status === 200) {
        const updatedTimesheets = userTimesheets.value.filter(timesheet => timesheet.timesheetid !== item.timesheetid)
        userTimesheets.value = updatedTimesheets
      } else {
        console.error('Failed to delete timesheet:', response.data.error)
      }
    } catch (error) {
      console.error('Error deleting timesheet:', error)
    }
  }
})

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