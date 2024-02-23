<template>
  <div :style="{
    'overflow-x': 'auto',
  }">
    <v-card 
      flat
      :style="{
        'min-width': '700px',
      }">
        <v-card
          class="d-flex justify-center rounded-0 pl-1 mb-4"
          style="padding-right: 100px;"
          elevation="2"
        >
          <v-col
            v-for="(label, index) in colLabels"
            :key="index"
            :style="computeColumnStyles(index)"
            :class="`d-flex ${index === 0 ? '' : 'justify-center'}`"
          >
            <div 
              v-if="lgAndUp"
              class="text-truncate text-center"
              >{{ label.lg }}</div>
            <div
              v-else
              class="text-truncate text-center"
            >{{ label.sm || label.lg }}</div>
            <!-- <div v-else>{{ label.xs || label.sm || label.lg }}</div> -->
        </v-col>
      </v-card>
      <TimesheetCellGrid />
    </v-card>
  </div>
</template>

<script setup lang='ts'>
import TimesheetCellGrid from './TimesheetCellGrid.vue';
import { useDisplay } from 'vuetify'
import { useSingleTimesheetDisplay } from '../stores/useDataStore'

const { lgAndUp } = useDisplay()
const { computeColumnStyles } = useSingleTimesheetDisplay()

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
</script>
