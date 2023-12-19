<template>
  <div>
    <Suspense v-if="state === 'allTimesheets'">
      <div>
        <TimesheetListDisplay />
        <v-container class="d-flex justify-end">
          <v-btn
            @click="handleAddNewTimesheet()"
            prepend-icon="mdi-plus"
          >
            New
          </v-btn>
        </v-container>
      </div>
      <template #fallback>
        <v-card
          flat
          style="width:100%; margin-top: 40vh;"
          class="d-flex justify-center"
        >
          <v-progress-circular indeterminate :size="57"></v-progress-circular>
        </v-card>
      </template>
    </Suspense>
    <v-btn
      v-if="state === 'editTimesheet'"
      @click="state = 'allTimesheets'"
      icon="mdi-chevron-left"
      flat
      class="ml-11 mt-2"
    ></v-btn>
    <EditTimesheet
      v-if="state === 'editTimesheet'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'

import EditTimesheet from '../components/EditTimesheet.vue'

const TimesheetListDisplay = defineAsyncComponent(() => 
  import('../components/TimesheetListDisplay.vue')
)

const state = ref<'allTimesheets' | 'editTimesheet'>('allTimesheets')

const handleAddNewTimesheet = () => {
  // probably pass in the timesheet id at a minimum
  // probably need to do an emit event or something from timesheetListDisplay depending on what is clicked on
  state.value = 'editTimesheet'
  return
}
</script>