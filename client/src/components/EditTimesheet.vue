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
            'max-height': 'calc(95vh - 170px)',
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
                v-model="cell.text"
                label="Project Name"
                :items="projectList"
                variant="outlined"
                density="compact"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :disabled="selectedProjects.includes(item.title)"
                  ></v-list-item>
                </template>
              </v-autocomplete>
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
              variant="tonal"
              color="red" 
              icon="mdi-delete"
              class="mt-3 mx-2"
            ></v-btn>
          </v-sheet>
        </v-sheet>
      </v-card>
    </div>
    <div class="d-flex justify-space-between">
      <v-btn
        @click="handleAddRow()"
        class="ml-10 mb-10"
        prepend-icon="mdi-plus"
      >Add</v-btn>
      <v-btn
        @click="handleSubmit()"
        class="mr-10 mb-10"
        color="success"
        append-icon="mdi-forward"
      >Submit</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'

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
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ text: '' }))
  )
)

const projectList = ['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']

const selectedProjects = computed(() => {
  return grid.value.map(row => row[0].text)
})

const handleAddRow = () => {
  return
}

const handleSubmit = () => {
  return
}
</script>