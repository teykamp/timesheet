<template>
  <div>
    <IsUserLoggedInWrapper>
      <template #contentIfLoggedIn>
        <div v-if="timesheetViewState === 'allTimesheets'">
          <TimesheetListDisplay
            :viewTimesheet="viewTimesheet"
            :timesheetListDisplayActions="timesheetListDisplayActions"
            :fetchData="getUserTimesheets"
            :userTimesheets="userTimesheets"
            :headerData="timesheetHeaderData"
          />
          <v-container 
            v-if="!isTimesheetListLoading"
            class="d-flex justify-end"
            style="position: absolute; right: 40px;"
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
        />
      </template>
    </IsUserLoggedInWrapper>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useHandleTimesheetDisplay, useSingleTimesheetDisplay } from '../stores/useDataStore'
import { useLoadingScreen, useDialog } from '../stores/useUserInterfaceStore'
import type { Timesheet } from '../types/types'
import { useGoogleUserData } from '../stores/useDataStore'
import { timesheetHeaderData } from '../functions/headerData'

import { useStateStatus } from '../composables/useCheckBeforeRouteLeave'

import EditTimesheet from '../components/EditTimesheet.vue'
import TimesheetListDisplay from '../components/TimesheetListDisplay.vue'
import IsUserLoggedInWrapper from '../components/IsUserLoggedInWrapper.vue'
import ViewTimesheetNote from '../components/ViewTimesheetNote.vue'

const useLoadingScreenStore = useLoadingScreen()
const { isTimesheetListLoading } = storeToRefs(useLoadingScreenStore)
const { resetTimesheetDisplay, setTimesheetDisplayStatus, setCurrentTimesheet, updateTimesheetViewState } = useHandleTimesheetDisplay()
const { timesheetViewState } = storeToRefs(useHandleTimesheetDisplay())
const { id, isUserLoggedIn } = useGoogleUserData()
const { setLoadingState } = useLoadingScreen()
const { showDialog } = useDialog()
const { resetTimesheetData, isTimesheetEmpty } = useSingleTimesheetDisplay()

const handleAddNewTimesheet = () => {
  resetTimesheetDisplay()
  resetTimesheetData()
  setTimesheetDisplayStatus('new')
  updateTimesheetViewState('singleTimesheet')
}

const userTimesheets = ref<Timesheet[]>([])

const timesheetListDisplayActions = ref({
  viewCommentsOnTimesheet: {
    key: 'comments',
    tooltip: 'View Comments',
    callback: (timesheet: Timesheet) => {
      showDialog(true, ViewTimesheetNote, { timesheet: timesheet })
    },
    icon: 'mdi-comment-outline',
    color: (timesheet: Timesheet) => (timesheet.timesheetNotesCount > 0 && timesheet.status === 'revised') ? 'warning' : '',
    disabled: (timesheet: Timesheet) => timesheet.timesheetNotesCount === 0 // todo: get timesheetnotecount on backend
  },

  editTimesheet: {
    key: 'edit',
    tooltip: 'Edit',
    callback: (timesheet: Timesheet) => {
      setTimesheetDisplayStatus('edit')
      setCurrentTimesheet(timesheet)
      updateTimesheetViewState('singleTimesheet')
    },
    icon: 'mdi-pencil',
    color: '',
    disabled: (timesheet: Timesheet) => timesheet.status === 'approved'
  },
  
  deleteTimesheet: {
    key: 'delete',
    tooltip: 'Delete',
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
  setCurrentTimesheet(timesheet)
  updateTimesheetViewState('singleTimesheet')
}

const getUserTimesheets = () => {
  if (!isUserLoggedIn()) return

  setLoadingState('isTimesheetListLoading', true)
  axios.get(`/api/timesheets/user/${id}`)
    .then(response => {
      const { data } = response
      userTimesheets.value = data.sort((a: Timesheet, b: Timesheet) => new Date(b.enddate).getTime() - new Date(a.enddate).getTime());
      setLoadingState('isTimesheetListLoading', false)
    })
    .catch(error => {
      console.error('Error fetching data:', error.message)
    })
}

const trackRef = useStateStatus(timesheetViewState, () => isTimesheetEmpty())
</script>