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
          v-model="(cell as Row).projectid"
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
              v-if="hasProperty(projectOrAlias, 'aliasId')"
              @mouseenter="currentHoverAlias = (projectOrAlias as ProjectAlias).aliasId"
              @mouseleave="currentHoverAlias = null"
              style="position: relative;"
            >
              <v-list-item
                v-bind="props"
                :disabled="selectedProjects.includes((projectOrAlias as ProjectAlias).projectid)"
              ></v-list-item>
              <div
                v-show="currentHoverAlias === (projectOrAlias as ProjectAlias).aliasId"
                style="position: absolute; right: 15px; bottom: calc(50% - 16px);"
              >
                <v-btn
                  @click="showDialog(true, AddProjectAlias, { projects, onSubmitClick: onAliasUpdate, initialAliasValue: projectOrAlias })"
                  variant="tonal"
                  size="x-small"
                  icon="mdi-pencil"
                  class="mr-2"
                ></v-btn>
                <v-btn
                  @click.stop="deleteProjectAliasFromList((projectOrAlias as ProjectAlias).aliasId)"
                  variant="tonal"
                  size="x-small"
                  color="red"
                  icon="mdi-delete"
                ></v-btn>
              </div>
            </div>
            <v-list-item
              v-else-if="(typeof projectOrAlias === 'object' && 'projectid' in projectOrAlias)"
              v-bind="props"
              :disabled="selectedProjects.includes((projectOrAlias as Project).projectid)"
            ></v-list-item>
            <v-list-item
              v-else
              @click="showDialog(true, AddProjectAlias, { projects, onSubmitClick: onAddProjectAliasSubmit })"
              variant="tonal"
              append-icon="mdi-plus"
            >Add New Alias</v-list-item>
          </template>
        </v-autocomplete>
        <v-text-field
          v-else
          v-model="(cell as Entry).entry.hoursWorked"
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

import type { Project, ProjectAlias, Row, Entry } from '../types/types'

const { timesheetData } = storeToRefs(useSingleTimesheetDisplay())
const { timesheetDisplayStatus } = storeToRefs(useHandleTimesheetDisplay())
const { id } = useGoogleUserData()
const { showDialog } = useDialog()
const { userAllowSaveCookies } = storeToRefs(useHandleUserSettings())
const { handleDeleteRow, computeColumnStyles, validateAllRules } = useSingleTimesheetDisplay()

const projects = ref<Project[]>([])

const projectAliases = ref<ProjectAlias[]>([])

const currentHoverAlias = ref<number | null>(null)

const hasProperty = (value: any, propertyName: string): boolean => {
  return value && typeof value === 'object' && propertyName in value
}

const selectedProjects = computed<(number | null)[]>(() => {
  return timesheetData.value.map(row => {
    if ('projectid' in row[0]) return (row[0] as Row).projectid
    return null
  })
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
    row.forEach((cell) => {
      if ('entry' in cell && cell.entry)
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
      if (index > 0 && 'entry' in cell && cell.entry) {
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

const onAliasUpdate = (aliasToUpdate: ProjectAlias) => {
  const index = projectAliases.value.findIndex(alias => alias.projectid === aliasToUpdate.projectid)
  projectAliases.value[index] = aliasToUpdate
  if (userAllowSaveCookies.value) localStorage.setItem(`aliases-${id}`, JSON.stringify(projectAliases.value))
}

const deleteProjectAliasFromList = (aliasId: number) => {
  projectAliases.value = projectAliases.value.filter(alias => alias.aliasId !== aliasId)
  if (userAllowSaveCookies.value) localStorage.setItem(`aliases-${id}`, JSON.stringify(projectAliases.value))
}
</script>
