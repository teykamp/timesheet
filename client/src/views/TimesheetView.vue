<template>
  <div>
    <Suspense v-if="state === 'allTimesheets'">
      <TimesheetListDisplay />
      <template #fallback>

        <p>Loading...</p>

      </template>

    </Suspense>
    <v-btn
      v-if="state === 'editTimesheet'"
      @click="state = 'allTimesheets'"
      icon="mdi-chevron-left"
      flat
      class="ml-11 position-absolute z-20"
    ></v-btn>
    <!-- probably pass in timesheet data -->
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


</script>