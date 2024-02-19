<template>
  <div>
    <IsUserLoggedInWrapper>
      <template #contentIfLoggedIn>
        <div v-if="timesheetViewState === 'allTimesheets'">
          <div 
            v-if="!isManager && loadDelay"
            class="d-flex justify-center mt-15 pt-15"
            style="width: 100%;"
          >
            <div>
              <h1>
                You are not a Manager
              </h1>
              <v-btn
                @click="router.push({ name: 'home' })"
                class="mt-10"
                prepend-icon="mdi-home"
              >Return Home</v-btn>
            </div>
          </div>
          <TimesheetListDisplay 
            v-show="isManager"
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
import { useRouter } from 'vue-router'

import { useHandleTimesheetDisplay, useGoogleUserData, useHandleManagerTimesheets } from '../stores/useDataStore'
import { useDialog } from '../stores/useUserInterfaceStore'
import { useLoadingScreen } from '../stores/useUserInterfaceStore'
import type { Timesheet } from '../types/types'
import { managerHeaderData } from '../functions/headerData'

import ViewTimesheetNote from '../components/ViewTimesheetNote.vue'
import EditTimesheet from '../components/EditTimesheet.vue'
import TimesheetListDisplay from '../components/TimesheetListDisplay.vue'
import IsUserLoggedInWrapper from '../components/IsUserLoggedInWrapper.vue'

const { setTimesheetDisplayStatus, setCurrentTimesheet, updateTimesheetViewState } = useHandleTimesheetDisplay()
const { timesheetViewState } = storeToRefs(useHandleTimesheetDisplay())
const { updateTimesheetStatus } = useHandleManagerTimesheets()
const { managerTimesheets } = storeToRefs(useHandleManagerTimesheets())
const { isManager } = storeToRefs(useGoogleUserData())
const { isUserLoggedIn, id } = useGoogleUserData()
const { setLoadingState } = useLoadingScreen()
const { showDialog } = useDialog()
const router = useRouter()

const timesheetListDisplayActions = ref({
  viewCommentsOnTimesheet: {
    key: 'comments',
    tooltip: 'View Comments',
    callback: (timesheet: Timesheet) => {
      showDialog(true, ViewTimesheetNote, { timesheet: timesheet })
    },
    icon: 'mdi-comment-outline',
    color: '',
    disabled: (timesheet: Timesheet) => !timesheet.timesheetNotesCount // < 1 and !undefined <- needs fix
  },

  approveTimesheet: {
    key: 'approve',
    tooltip: (timesheet: Timesheet) => timesheet.status === 'approved' ? 'Retract' : 'Approve',
    callback: updateTimesheetStatus,
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
  setCurrentTimesheet(timesheet)
  updateTimesheetViewState('singleTimesheet')
}

const getManagerTimesheets = () => {
  if (!isUserLoggedIn()) return
  if (!isManager) return

  setLoadingState('isTimesheetListLoading', true)
  axios.get(`/api/timesheets/manager/${id}`)
    .then(response => {
      const { data } = response
      managerTimesheets.value = data.sort((a: Timesheet, b: Timesheet) => new Date(b.enddate).getTime() - new Date(a.enddate).getTime())
      setLoadingState('isTimesheetListLoading', false)
    })
    .catch(error => {
      console.error('Error fetching data:', error.message)
    })
}

const loadDelay = ref(false)
setTimeout(() => {
  loadDelay.value = true
}, 200)
</script>