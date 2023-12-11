<template>
  <v-card 
    flat
    :style="{
      'min-width': '600px',
  }">
    <v-card
      class="d-flex justify-center rounded-0"
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
    <v-sheet :style="{
      'max-height': '79vh',
      overflow: 'auto',
    }">
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
            label="Project Name"
            :items="projectList"
            variant="outlined"
            density="compact"
          ></v-autocomplete>
          <v-text-field
            v-if="colIndex !== 0"
            v-model="cell.text"  
            variant="outlined" 
            label="Hours" 
            density="compact" 
          />
        </v-col>
        <v-btn 
          size="small" 
          icon="mdi-delete"
          class="mt-3"
        ></v-btn>
      </v-sheet>
    </v-sheet>
    <v-btn
      class="ml-10 mb-10"
      prepend-icon="mdi-plus"
    >Add</v-btn>
  </v-card>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

const { lgAndUp } = useDisplay()
const rows = 10
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
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ text: '' }))
  )
)

const getTimesheets = async () => {
  try {
    const response = await axios.get('/api/timesheets')
    const { data } = response
    timesheets.value = data
  } catch (error) {
    console.error('Error fetching timesheets:', error)
  }
}

const timesheets = ref([])

const getTimesheetEntries = async () => {
  try {
    const response = await axios.get(`api/timesheetEntries/${1}`)
    const { data } = response
    console.log(data)
    return data
  } catch (error) {
    console.error('Error fetching timesheetEntries:', error)
  }
}

const projectList = ['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']


</script>