<template>
  <div>
    <div :style="{
      'overflow-x': 'auto',
    }">
    <v-card 
      flat
      :style="{
        'min-width': '600px',
    }">
        <v-card
          class="d-flex justify-center rounded-0 pr-8 pl-1"
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
            'max-height': 'calc(88vh - 170px)',
            overflow: 'auto',
          }"
        >
          <v-sheet 
            v-for="(row, rowIndex) in grid" 
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
                label="Project Name"
                :items="projects"
                item-title="projectname"
                item-value="projectid"
                density="compact"
                variant="outlined"
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
                variant="outlined" 
                :rules="[validateAllRules]"
                label="Hours" 
                density="compact" 
              />
            </v-col>
            <v-btn 
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
        @click="handleAddRow()"
        :color="`${grid.length === 0 ? 'red' : ''}`"
        :class="`ml-10 ${grid.length === 0 ? 'animate-bounce' : ''}`"
        prepend-icon="mdi-plus"
      >Add</v-btn>
      <v-btn
        @click="handleSubmit()"
        :disabled="grid.length === 0 || !allRulesPassed || !grid.every(row => row[0].projectid !== null)"
        class="mr-10"
        color="success"
        append-icon="mdi-forward"
      >Submit</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import type { Project } from '../stores/useDataStore'
import { useGoogleUserData } from '../stores/useDataStore'

const { id } = useGoogleUserData()

const { lgAndUp } = useDisplay()
const rows = 3
const cols = 6

// need function here to get dates (library probably)
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


const grid = ref(
  Array.from({ length: rows }, () => {
    const row = [];
    row.push({ projectid: null })
    for (let i = 0; i < cols - 1; i++) {
      row.push({ entry: {  projectid: null, hoursWorked: 0, date: 'now' } })
    }
    return row
  })
)

const projects = ref<Project[]>([])

const selectedProjects = computed(() => {
  return grid.value.map(row => row[0].projectid === null ? null : row[0].projectid)
})

const handleAddRow = () => {
  const newRow = []
  newRow.push({ projectid: null })
  for (let i = 0; i < cols - 1; i++) {
    newRow.push({ entry: { date: '', hoursWorked: 0, projectid: null } })
  }
  grid.value.push(newRow)
}

const handleDeleteRow = (rowIndex: number) => {
  grid.value.splice(rowIndex, 1);
}

const handleSubmit = () => {
  axios.post('/api/timesheets', { 
    userId: id,
    endDate: 'now',
    status: 'submitted',
    entries: grid.value.map((row) => {
      const [, ...entryColumns] = row

      return entryColumns.map((cell) => ({
        ...cell,
        entry: {
          ...cell.entry,
          projectid: row[0].projectid,
        },
      }))
    }) // remove first column (PN)
  })
    .then(response => {
      console.log('Successfully posted timesheet:', response.data);
    })
    .catch(error => {
      console.error('Error posting timesheet:', error.response ? error.response.data : error.message);
    });

  // sackbar display
  return
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
</script>