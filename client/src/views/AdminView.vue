<template>
  <div>
    <IsUserLoggedInWrapper>
      <template #contentIfLoggedIn>
        <div v-if="timesheetViewState === 'allTimesheets'">
          <TimesheetListDisplay 
            :viewTimesheet="viewTimesheet" 
            :timesheetListDisplayActions="timesheetListDisplayActions"
            :fetchData="getManagerTimesheets" 
            :userTimesheets="managerTimesheets" 
            :headerData="managerHeaderData" 
          />
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
        />
      </template>
    </IsUserLoggedInWrapper>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useHandleTimesheetDisplay, useGoogleUserData } from '../stores/useDataStore'
import { useDialog } from '../stores/useUserInterfaceStore'
import { useLoadingScreen } from '../stores/useUserInterfaceStore'
import type { ManagerTimesheet, Timesheet } from '../types/types'
import { managerHeaderData } from '../functions/headerData'

import ViewTimesheetNote from '../components/ViewTimesheetNote.vue'
import EditTimesheet from '../components/EditTimesheet.vue'
import TimesheetListDisplay from '../components/TimesheetListDisplay.vue'
import IsUserLoggedInWrapper from '../components/IsUserLoggedInWrapper.vue'

const { setTimesheetDisplayStatus, setCurrentTimesheet, updateTimesheetViewState } = useHandleTimesheetDisplay()
const useTimesheetStateStore = useHandleTimesheetDisplay()
const { timesheetViewState } = storeToRefs(useTimesheetStateStore)
const { isUserLoggedIn, id } = useGoogleUserData()
const { setLoadingState } = useLoadingScreen()
const { showDialog } = useDialog()

const managerTimesheets = ref<ManagerTimesheet[]>([])

const timesheetListDisplayActions = ref({
  viewCommentsOnTimesheet: {
    key: 'comments',
    tooltip: 'View Comments',
    callback: (timesheet: Timesheet) => {
      showDialog(true, ViewTimesheetNote, { timesheetId: timesheet.timesheetid })
    },
    icon: 'mdi-comment-outline',
    color: '',
    disabled: (timesheet: Timesheet) => timesheet.status === 'approved'
  },

  approveTimesheet: {
    key: 'approve',
    tooltip: (timesheet: Timesheet) => timesheet.status === 'approved' ? 'Retract' : 'Approve',
    callback: async (timesheet: Timesheet) => { // needs to be imported so can use elsewhere. needed inside createTimesheetNote and EditTimesheet
      const status = timesheet.status === 'approved' ? 'submitted' : 'approved'
      try {
        const response = await axios.put(`/api/timesheets/${timesheet.timesheetid}/status`, { status })

        if (response.status === 200) {
          const responseData = response.data
          const indexToUpdate = managerTimesheets.value.findIndex(managerTimesheet => managerTimesheet.timesheetid === responseData.timesheetid)
          if (indexToUpdate !== -1) {
            responseData.totalHours = managerTimesheets.value[indexToUpdate].totalHours
            responseData.email = managerTimesheets.value[indexToUpdate].email
            managerTimesheets.value[indexToUpdate] = responseData
          }
        } else {
          console.error('Unexpected status:', response.status)
        }
      } catch (error) {
        console.error('Error updating timesheet status:', error)
      }
  },
    icon: (timesheet: Timesheet) => timesheet.status === 'approved' ? 'mdi-file-cancel-outline' : 'mdi-file-check-outline',
    color: (timesheet: Timesheet) => timesheet.status === 'approved' ? 'red' : 'green',
    disabled: () => false
  },

  deleteTimesheet: {
    key: 'delete',
    tooltip: 'Delete',
    callback: async (timesheetToDelete: Timesheet) => {
      try {
        const response = await axios.delete(`/api/timesheets/${timesheetToDelete.timesheetid}`)

        if (response.status === 200) {
          const updatedTimesheets = managerTimesheets.value.filter(timesheet => timesheet.timesheetid !== timesheetToDelete.timesheetid)
          managerTimesheets.value = updatedTimesheets
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

const getManagerTimesheets = () => {
  if (!isUserLoggedIn()) return

  setLoadingState('isTimesheetListLoading', true)
  axios.get(`/api/timesheets/manager/${id}`)
    .then(response => {
      const { data } = response
      managerTimesheets.value = data.reverse()
      setLoadingState('isTimesheetListLoading', false)
    })
    .catch(error => {
      console.error('Error fetching data:', error.message)
    })
}
</script>