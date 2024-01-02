<template>
  <div>
    <IsUserLoggedInWrapper>
      <template #contentIfLoggedIn>
        <div v-if="state === 'allTimesheets'">
          <TimesheetListDisplay
            :updateState="updateState"
            :timesheetListDisplayActions="timesheetListDisplayActions"
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
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import type { TimesheetStateTypes } from '../stores/useDataStore'
import { useHandleTimesheetDisplay } from '../stores/useDataStore'
import { useLoadingScreen } from '../stores/useUserInterfaceStore'
import type { Timesheet } from '../stores/types'


import EditTimesheet from '../components/EditTimesheet.vue'
import TimesheetListDisplay from '../components/TimesheetListDisplay.vue'
import IsUserLoggedInWrapper from '../components/IsUserLoggedInWrapper.vue'

const useLoadingScreenStore = useLoadingScreen()
const { isTimesheetListLoading } = storeToRefs(useLoadingScreenStore)
const { resetTimesheetDisplay, setTimesheetDisplayStatus, setCurrentTimesheet } = useHandleTimesheetDisplay()

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
  }
})
</script>