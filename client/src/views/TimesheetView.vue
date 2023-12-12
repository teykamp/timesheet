<template>
  <div>

    <TimesheetListDisplay 
      v-if="state === 'allTimesheets'"
    />
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
import EditTimesheet from '../components/EditTimesheet.vue'
import TimesheetListDisplay from '../components/TimesheetListDisplay.vue'

import { ref } from 'vue'

const state = ref<'allTimesheets' | 'editTimesheet'>('allTimesheets')

</script>