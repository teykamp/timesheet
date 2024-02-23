<template>
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
        :style="computeColumnStyles(colIndex)"
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
        <div 
          v-if="rowIndex === timesheetData.length - 1" 
        >
          <p v-if="colIndex === 0"
          >Total</p>
          <p 
            class="text-center"
            :style="{
              ...totalsStyles,
              }"
          >
            {{ computeColumnTotals[colIndex-1] }}
          </p>
        </div>
      </v-col>
      <p
        v-if="true"
        class="mt-5 text-center"
        :style="{
          ...totalsStyles,
          width: '25px',
        }"
      >{{ computeRowTotals[rowIndex] }}</p>
      
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
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSingleTimesheetDisplay, useHandleTimesheetDisplay } from '../stores/useDataStore'

import type { Project } from '../types/types'

const { timesheetData } = storeToRefs(useSingleTimesheetDisplay())
const { timesheetDisplayStatus } = storeToRefs(useHandleTimesheetDisplay())

const { handleDeleteRow, computeColumnStyles, validateAllRules } = useSingleTimesheetDisplay()


const projects = ref<Project[]>([])

const selectedProjects = computed(() => {
  return timesheetData.value.map(row => row[0].projectid === null ? null : row[0].projectid)
})

const totalsStyles = {
  'text-wrap': 'nowrap',
  'text-overflow': 'ellipsis',
  'overflow': 'hidden',
}

const computeRowTotals = computed(() => {
  const rowTotals: number[] = []
  timesheetData.value.forEach(row => {
    let totalHours = 0
    row.forEach(cell => {
      if (cell.entry && typeof Number(cell.entry.hoursWorked) === 'number')
        totalHours += Number(cell.entry.hoursWorked)
    })
    rowTotals.push(totalHours)
  })
  return rowTotals
})

const computeColumnTotals = computed(() => {
  const colTotals: number[] = []

  timesheetData.value.forEach(row => {
    row.forEach((cell, index) => {
      if (index > 0 && cell.entry && typeof Number(cell.entry.hoursWorked) === 'number') {
        if (!colTotals[index - 1]) colTotals[index - 1] = 0
        colTotals[index - 1] += Number(cell.entry.hoursWorked)
      }
    })
  })
  return colTotals
})

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
</script>
