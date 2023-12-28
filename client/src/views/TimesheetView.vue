<template>
  <div>
    <div v-if="state === 'allTimesheets'">
      <TimesheetListDisplay
        :updateState="updateState"
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import type { TimesheetStateTypes } from '../stores/useDataStore'
import { useHandleTimesheetDisplay } from '../stores/useDataStore'
import { useLoadingScreen } from '../stores/useUserInterfaceStore'

import EditTimesheet from '../components/EditTimesheet.vue'
import TimesheetListDisplay from '../components/TimesheetListDisplay.vue'

const useLoadingScreenStore = useLoadingScreen()
const { isTimesheetListLoading } = storeToRefs(useLoadingScreenStore)
const { resetTimesheetDisplay, setTimesheetDisplayStatus } = useHandleTimesheetDisplay()

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
</script>