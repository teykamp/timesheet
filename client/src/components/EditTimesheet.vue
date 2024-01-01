<template>
  <div>
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
                  background: formatDateToDDMMYY(weekEndingIn) === formatDateToDDMMYY(date.friday) ? blueShadow : '',
                  color: formatDateToDDMMYY(weekEndingIn) === formatDateToDDMMYY(date.friday) ? white : ''
                }"
                :appendIcon="formatDateToDDMMYY(date.friday) === formatDateToDDMMYY(getMondayAndFriday(new Date).friday) ? 'mdi-calendar-today' : ''"
              >
                <v-list-item-title>{{ 'Mon,' + formatDateToDDMMYY(date.monday) }} to {{ 'Fri,' + formatDateToDDMMYY(date.friday) }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn
            v-if="timesheetDisplayStatus !== 'view'"
            @click="timesheetDisplayStatus === 'edit' ? handleUpdateTimesheet('working') : handleSubmitTimesheet('working')"
            :disabled="timesheetData.length === 0 || !allRulesPassed || !timesheetData.every(row => row[0].projectid !== null) || timesheetDisplayStatus === 'view'"
            class="ma-4"
            color="primary"
          >{{ timesheetDisplayStatus === 'edit' ? 'Update' : 'Save' }}</v-btn>
        </div>
        <div :style="{
          'overflow-x': 'auto',
        }">
        <v-card 
          flat
          :style="{
            'min-width': '600px',
        }">
            <v-card
              class="d-flex justify-center rounded-0 pr-8 pl-1 mb-4"
              elevation="2"
            >
              <v-col
                v-for="(label, index) in colLabels"
                :key="index"
                :style="{
                  'min-width': index === 0 ? '200px' : '50px',
                  'max-width': index === 0 ? '500px' : '150px'
                }"
              >
                  <div 
                    v-if="lgAndUp"
                    class="text-truncate"
                    >{{ label.lg }}</div>
                  <div
                    v-else
                    class="text-truncate"
                  >{{ label.sm || label.lg }}</div>
                  <!-- <div v-else>{{ label.xs || label.sm || label.lg }}</div> -->
              </v-col>
            </v-card>
            <v-sheet 
              :style="{
                'max-height': 'calc(88vh - 200px)',
                overflow: 'auto',
              }"
            >
              <v-sheet 
                v-for="(row, rowIndex) in timesheetData" 
                :key="rowIndex"
                class="d-flex justify-center"
              >
                <v-col 
                  v-for="(cell, colIndex) in row" 
                  :key="colIndex" 
                  :style="{
                    'min-width': colIndex === 0 ? '200px' : '50px',
                    'max-width': colIndex === 0 ? '500px' : '150px'
                  }"
                >
                  <v-autocomplete
                    v-if="colIndex === 0"
                    v-model="cell.projectid"
                    :items="projects"
                    label="Project Name"
                    item-title="projectname"
                    item-value="projectid"
                    density="compact"
                    variant="outlined"
                    :readonly="timesheetDisplayStatus === 'view'"
                  >
                    <template #item="{ props, item }">
                      <v-list-item
                        v-bind="props"
                        :disabled="selectedProjects.includes(item.value)"
                      ></v-list-item>
                    </template>
                  </v-autocomplete>
                  <!-- error handled thorugh v-if -->
                  <v-text-field
                    v-else
                    v-model="cell.entry.hoursWorked"  
                    :rules="[validateAllRules]"
                    :readonly="timesheetDisplayStatus === 'view'"
                    label="Hours" 
                    variant="outlined" 
                    density="compact" 
                  />
                </v-col>
                <v-btn 
                  v-if="timesheetDisplayStatus !== 'view'"
                  @click="handleDeleteRow(rowIndex)"
                  size="small"
                  variant="tonal"
                  color="red" 
                  icon="mdi-delete"
                  class="mt-3 mx-2"
                ></v-btn>
              </v-sheet>
            </v-sheet>
          </v-card>
        </div>
        <div class="d-flex justify-space-between mt-8">
          <v-btn
            v-if="timesheetDisplayStatus !== 'view'"
            @click="handleAddRow()"
            :color="`${timesheetData.length === 0 ? 'red' : ''}`"
            :class="`ml-10 ${timesheetData.length === 0 ? 'animate-bounce' : ''}`"
            prepend-icon="mdi-plus"
          >Add</v-btn>
          <v-btn
            v-if="timesheetDisplayStatus !== 'view'"
            @click="timesheetDisplayStatus === 'edit' ? handleUpdateTimesheet('submitted') : handleSubmitTimesheet('submitted')"
            :disabled="timesheetData.length === 0 || !allRulesPassed || !timesheetData.every(row => row[0].projectid !== null)"
            class="mr-10"
            color="success"
            append-icon="mdi-forward"
          >{{ timesheetDisplayStatus === 'edit' ? 'Resubmit' : 'Submit' }}</v-btn>
        </div>
      </template>
    </IsContentLoadingWrapper>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'

import IsContentLoadingWrapper from './IsContentLoadingWrapper.vue'

import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useDisplay } from 'vuetify'
import type { Project, TimesheetStateTypes } from '../stores/useDataStore'
import { useHandleTimesheetDisplay } from '../stores/useDataStore'
import { useGoogleUserData } from '../stores/useDataStore'
import { useLoadingScreen, useSnackbar, useColorPalette } from '../stores/useUserInterfaceStore'

import { getMonthRange, formatDateToDDMMYY, getMondayAndFriday } from '../functions/dateUtils'

const { id } = useGoogleUserData()
const { setLoadingState } = useLoadingScreen()
const useLoadingScreenStore = useLoadingScreen()
const { isTimesheetContentLoading } = storeToRefs(useLoadingScreenStore)

const { currentEditTimesheet } = useHandleTimesheetDisplay()
const useHandleTimesheetDisplayStore = useHandleTimesheetDisplay()
const  { timesheetDisplayStatus } = storeToRefs(useHandleTimesheetDisplayStore)
const { showSnackbar } = useSnackbar()

const { blueShadow, white } = useColorPalette()

const { lgAndUp } = useDisplay()

const props = defineProps<{
  updateState: (newState: TimesheetStateTypes) => void,
}>()

// display default
const rows = 3
const cols = 6

const colLabelsBase = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday'
]

const colLabels = colLabelsBase.map(label => ({
  lg: label,
  sm: label.slice(0, 3),
  xs: label.slice(0, 1)
}))

colLabels.unshift({
  lg: 'Project Name',
  sm: 'Project Name',
  xs: 'PN'
})

const allRulesPassed = ref(false)

const positiveNumberRule = (value: any) => {
  return /^[+]?\d*\.?\d+$/.test(value) || 'Error NaN'
}
const multipleOfQuarterRule = (value: any) => {
  return (parseFloat(value) % 0.25 === 0) || 'Error *.25'
}
const validateAllRules = (value: any) => {
  const rules = [positiveNumberRule, multipleOfQuarterRule]
  for (const rule of rules) {
    const result = rule(value)
    if (result !== true) {
      allRulesPassed.value = false
      console.log(allRulesPassed.value)
      return result
    }
  }
  allRulesPassed.value = true
  return true
}


const timesheetData = ref(
  Array.from({ length: rows }, () => {
    const row = [];
    row.push({ projectid: null })
    for (let i = 0; i < cols - 1; i++) {
      row.push({ entry: {  projectid: null, hoursWorked: 0, date: null } })
    }
    return row
  })
)

const projects = ref<Project[]>([])

const selectedProjects = computed(() => {
  return timesheetData.value.map(row => row[0].projectid === null ? null : row[0].projectid)
})

const handleAddRow = () => {
  const newRow = []
  newRow.push({ projectid: null })
  for (let i = 0; i < cols - 1; i++) {
    newRow.push({ entry: { projectid: null, hoursWorked: 0, date: null } })
  }
  timesheetData.value.push(newRow)
}

const handleDeleteRow = (rowIndex: number) => {
  timesheetData.value.splice(rowIndex, 1);
}

const buildTimesheetData = (status: 'submitted' | 'working') => {
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

const handleSubmitTimesheet = async (status: 'submitted' | 'working') => {
  try {
    await axios.post('/api/timesheets', buildTimesheetData(status))

    showSnackbar(`Timesheet ${status === 'submitted' ? 'submitted' : 'saved'}!`)
    props.updateState('allTimesheets')
  } catch (error) {
    console.error('Error posting timesheet:', error)
  }
}

const handleUpdateTimesheet = async (status: 'submitted' | 'working') => {
  try {
    await axios.put(`/api/timesheets/${currentEditTimesheet}`, buildTimesheetData(status))

    showSnackbar(`Timesheet ${status === 'submitted' ? 're-submitted' : 'updated'}!`)
    props.updateState('allTimesheets')

  } catch (error) {
    console.error('Error updating timesheet:', error)
  }
}

const getProjects = () => {
  axios.get(`/api/projects`)
    .then(response => {
      const { data } = response
      projects.value = data
    })
    .catch(error => {
      console.error('Error fetching data:', error.message)
    })
}

getProjects()

const dateRange = ref(getMonthRange())
const weekEndingIn = ref(getMondayAndFriday(new Date()).friday)

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
  getViewTimesheetData(currentEditTimesheet)
}
</script>