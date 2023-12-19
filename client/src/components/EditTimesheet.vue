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
          class="mt-6"
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
                v-model="cell.projectId"
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
              <v-text-field
                v-else
                v-model="cell.entry.hours"  
                variant="outlined" 
                label="Hours" 
                density="compact" 
              />
            </v-col>
            <v-btn 
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
        class="ml-10"
        prepend-icon="mdi-plus"
      >Add</v-btn>
      <v-btn
        @click="handleSubmit()"
        class="mr-10"
        color="success"
        append-icon="mdi-forward"
      >Submit</v-btn>
    </div>
    {{ grid }}
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import type { Project } from '../stores/useDataStore'

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

const grid = ref(
  Array.from({ length: rows }, () => {
    const row = [];
    row.push({ projectId: null })
    for (let i = 0; i < cols - 1; i++) {
      row.push({ entry: { date: '', hours: 0 } })
    }
    return row
  })
)

const projects = ref<Project[]>([])

const selectedProjects = computed(() => {
  return grid.value.map(row => row[0].projectId === null ? null : row[0].projectId)
})

const handleAddRow = () => {
  return
}

const handleSubmit = () => {
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