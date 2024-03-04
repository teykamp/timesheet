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
          :items="['Add New Alias', ...projectAliases, ...projects]"
          label="Project Name"
          density="compact"
          variant="outlined"
          item-title="projectname"
          item-value="projectid"
          :readonly="timesheetDisplayStatus === 'view'"
        >
          <template #item="{ props, item: { raw: projectOrAlias }}">
            <div 
              v-if="hasProperty(projectOrAlias, 'isAlias')"
              style="position: relative;"
            >
              <v-list-item
                v-bind="props"
                :disabled="selectedProjects.includes(projectOrAlias.projectid)"
              >
              </v-list-item>
               <v-btn
                @click.stop="deleteProjectAliasFromList(projectOrAlias.projectid)"
                style="position: absolute; right: 15px; bottom: calc(50% - 16px);"
                variant="tonal"
                size="x-small"
                color="red"
                icon="mdi-delete"
              ></v-btn>
            </div>
            <v-list-item
              v-else-if="(typeof projectOrAlias === 'object' && 'projectid' in projectOrAlias)"
              v-bind="props"
              :disabled="selectedProjects.includes(projectOrAlias.projectid)"
            ></v-list-item>
            <v-list-item
              v-else
              @click="showDialog(true, AddProjectAlias, { projects, onAddProjectAliasSubmit })"
              variant="tonal"
              append-icon="mdi-plus"
            >Add New Alias</v-list-item>
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
import { useSingleTimesheetDisplay, useHandleTimesheetDisplay, useGoogleUserData, useHandleUserSettings } from '../stores/useDataStore'
import { useDialog } from '../stores/useUserInterfaceStore'

import AddProjectAlias from './AddProjectAlias.vue'

import type { Project, ProjectAlias } from '../types/types'

const { timesheetData } = storeToRefs(useSingleTimesheetDisplay())
const { timesheetDisplayStatus } = storeToRefs(useHandleTimesheetDisplay())
const { id } = useGoogleUserData()
const { showDialog } = useDialog()
const { userAllowSaveCookies } = storeToRefs(useHandleUserSettings())
const { handleDeleteRow, computeColumnStyles, validateAllRules } = useSingleTimesheetDisplay()

const projects = ref<Project[]>([])

const projectAliases = ref<ProjectAlias[]>([])

const hasProperty = (value: any, propertyName: string): boolean => {
  return value && typeof value === 'object' && propertyName in value
}

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

const loadStoredProjectAliases = () => {
  const existingAliasesJson = localStorage.getItem(`aliases-${id}`)
  projectAliases.value = existingAliasesJson ? JSON.parse(existingAliasesJson) : []
}

if (userAllowSaveCookies.value) {
  loadStoredProjectAliases()}

const onAddProjectAliasSubmit = (newAlias: ProjectAlias) => {
  projectAliases.value.push(newAlias)
  if (userAllowSaveCookies.value) localStorage.setItem(`aliases-${id}`, JSON.stringify(projectAliases.value))
}

const deleteProjectAliasFromList = (aliasId: number) => {
  projectAliases.value = projectAliases.value.filter(alias => alias.projectid !== aliasId)
  if (userAllowSaveCookies.value) localStorage.setItem(`aliases-${id}`, JSON.stringify(projectAliases.value))
}
</script>
