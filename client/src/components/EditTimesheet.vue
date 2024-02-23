<template>
  <IsContentLoadingWrapper :displayCondition="!(isTimesheetContentLoading && timesheetDisplayStatus !== 'new')">
    <template #loadedContent>
      <div class="w-100 d-flex justify-end">
        <v-menu>
          <template v-slot:activator="{ props }">
            <div 
              v-if="timesheetDisplayStatus === 'view'"
              class="ma-4 mr-10"
            >{{ 'Week Ending In:' + formatDateToDDMMYY(weekEndingIn) }}</div>
            <v-btn
              v-else
              v-bind="props"
              append-icon="mdi-menu-down"
              class="ma-4"
              flat
            >
              {{ 'Week Ending In:' +  formatDateToDDMMYY(weekEndingIn) }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(date, index) in dateRange"
              :key="index"
              @click="weekEndingIn = date.friday"
              :style="{
                background: isCurrentWeek(date) ? blueShadow : '',
                color: isCurrentWeek(date) ? white : ''
              }"
              :appendIcon="isCurrentWeekIcon(date)"
            >
              <v-list-item-title>{{ 'Mon,' + formatDateToDDMMYY(date.monday) }} to {{ 'Fri,' + formatDateToDDMMYY(date.friday) }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          v-if="timesheetDisplayStatus !== 'view'"
          @click="handleSubmitTimesheet('working')"
          :disabled="canSaveOrSubmitTimesheet"
          class="ma-4"
          color="primary"
        >{{ timesheetDisplayStatus === 'edit' ? 'Update' : 'Save' }}</v-btn>
      </div>

      <Timesheet />

      <div class="d-flex justify-space-between mt-8">
        <v-btn
          v-if="timesheetDisplayStatus !== 'view'"
          @click="handleAddRow()"
          :color="timesheetData.length === 0 ? 'red' : ''"
          :class="`ml-10 ${timesheetData.length === 0 ? 'animate-bounce' : ''}`"
          prepend-icon="mdi-plus"
        >Add</v-btn>
        <v-btn
          v-if="timesheetDisplayStatus !== 'view'"
          @click="handleSubmitTimesheet('submitted')"
          :disabled="canSaveOrSubmitTimesheet"
          class="mr-10"
          color="success"
          append-icon="mdi-forward"
        >{{ timesheetDisplayStatus === 'edit' ? 'Resubmit' : 'Submit' }}</v-btn>
        <v-btn
          v-if="managerIsViewing && computeApprovalButtonStyles"
          @click="showDialog(true, CreateTimesheetNote, { timesheetId: currentEditTimesheet?.timesheetid })"
          prepend-icon="mdi-pencil"
          class="ml-6"
        >Request Edits</v-btn>
        <v-btn
          v-if="managerIsViewing"
          @click="updateTimesheetStatus(currentEditTimesheet, computeUpdateTimesheetStatusName,
            () => { 
              showSnackbar(`Timesheet ${computeUpdateTimesheetStatusSnackbarText}`)
              updateTimesheetViewState('allTimesheets')
            }
          )"
          class="mr-6"
          :color="computeApprovalButtonStyles ? 'green' : 'red'"
          :prepend-icon="computeApprovalButtonStyles ? 'mdi-file-check-outline' : 'mdi-file-cancel-outline'"
        >{{ computeApprovalButtonStyles ? 'Approve' : 'Retract' }}</v-btn>
      </div>
    </template>
  </IsContentLoadingWrapper>
</template>

<script setup lang="ts">
import axios, { all } from 'axios'

import IsContentLoadingWrapper from './IsContentLoadingWrapper.vue'
import CreateTimesheetNote from './CreateTimesheetNote.vue'
import Timesheet from './Timesheet.vue'

import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import { useHandleTimesheetDisplay, useSingleTimesheetDisplay, useHandleManagerTimesheets } from '../stores/useDataStore'
import { useGoogleUserData } from '../stores/useDataStore'
import { useLoadingScreen, useSnackbar, useColorPalette, useDialog } from '../stores/useUserInterfaceStore'

import { getMonthRange, formatDateToDDMMYY, getMondayAndFriday } from '../functions/dateUtils'
import type { DatePair } from '../functions/dateUtils'

const { id } = useGoogleUserData()
const { setLoadingState } = useLoadingScreen()
const { isTimesheetContentLoading } = storeToRefs(useLoadingScreen())
const { showDialog } = useDialog()

const { currentEditTimesheet, updateTimesheetViewState } = useHandleTimesheetDisplay()
const { timesheetDisplayStatus } = storeToRefs(useHandleTimesheetDisplay())
const { showSnackbar } = useSnackbar()
const { updateTimesheetStatus } = useHandleManagerTimesheets()

const { blueShadow, white } = useColorPalette()

const { timesheetData, allRulesPassed } = storeToRefs(useSingleTimesheetDisplay())
const { handleAddRow } = useSingleTimesheetDisplay()


const route = useRoute()
const currentRouteName = computed(() => route.name)

const computeApprovalButtonStyles = computed(() => currentEditTimesheet && currentEditTimesheet.status !== 'approved')

const canSaveOrSubmitTimesheet = computed(() => !(timesheetData.value.length > 0 
                                             && allRulesPassed.value 
                                             && timesheetData.value.every(row => row[0].projectid !== null)
                                             && timesheetDisplayStatus.value !== 'view')
                                            )

const managerIsViewing = computed(() => currentRouteName.value === 'admin' && timesheetDisplayStatus.value === 'view')

const computeUpdateTimesheetStatusName = computed(() => {
  if (!currentEditTimesheet) return 'approved'
  return currentEditTimesheet.status === 'approved' ? 'revised' : 'approved'
})

const computeUpdateTimesheetStatusSnackbarText = computed(() => {
  if (!currentEditTimesheet) return 'Approved'
  return currentEditTimesheet.status === 'approved' ? 'Retracted' : 'Approved'
})

type Status = 'submitted' | 'working'

const buildTimesheetData = (status: Status) => {
  return {
    userId: id,
    endDate: weekEndingIn.value,
    status,
    entries: timesheetData.value.map((row) => {
      const [, ...entryColumns] = row

      const endDate = new Date(weekEndingIn.value)

      return entryColumns.map((cell, columnIndex) => {
        const currentDate = new Date(endDate)
        currentDate.setDate(endDate.getDate() - (entryColumns.length - columnIndex - 1))

        return {
          ...cell,
          entry: {
            ...cell.entry,
            projectid: row[0].projectid,
            date: currentDate,
          },
        }
      })
    }) // remove the first column (PN)
  }
}


const handleSubmitTimesheet = async (status: Status) => {
  try {
    await axios.post('/api/timesheets', buildTimesheetData(status))

    showSnackbar(`Timesheet ${status === 'submitted' ? 'submitted' : 'saved'}!`)
    updateTimesheetViewState('allTimesheets')
  } catch (error) {
    console.error('Error posting timesheet:', error)
  }
}

// DOES THIS NEED TO BE USED??
// const handleUpdateTimesheet = async (status: Status) => {
//   try {
//     await axios.put(`/api/timesheets/${currentEditTimesheet?.timesheetid}`, buildTimesheetData(status))

//     showSnackbar(`Timesheet ${status === 'submitted' ? 're-submitted' : 'updated'}!`)
//     updateTimesheetViewState('allTimesheets')

//   } catch (error) {
//     console.error('Error updating timesheet:', error)
//   }
// }

const dateRange = ref(getMonthRange())
const weekEndingIn = ref(getMondayAndFriday(new Date()).friday)

const isCurrentWeek = (date: DatePair) => formatDateToDDMMYY(weekEndingIn.value) === formatDateToDDMMYY(date.friday)
const isCurrentWeekIcon = (date: DatePair) => formatDateToDDMMYY(date.friday) === formatDateToDDMMYY(getMondayAndFriday(new Date).friday) ? 'mdi-calendar-today' : ''

const getViewTimesheetData = (timesheetId: number) => {
  setLoadingState('isTimesheetContentLoading', true)
  axios.get(`/api/timesheetEntries/FormattedBy/${timesheetId}`)
    .then(response => {
      const { data } = response
      timesheetData.value = data.reverse()
      setLoadingState('isTimesheetContentLoading', false)
    })
    .catch(error => {
      console.error('Error fetching data:', error.message)
    })
}

if (timesheetDisplayStatus.value === 'view' || timesheetDisplayStatus.value === 'edit') {
  if (!currentEditTimesheet) {
    showSnackbar('Oops! Something went wrong...', 'red')
    console.error('timesheetId is undefined!')
  } 
  else getViewTimesheetData(currentEditTimesheet.timesheetid)
}
</script>