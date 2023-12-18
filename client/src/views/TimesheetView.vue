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
import axios from 'axios'
import EditTimesheet from '../components/EditTimesheet.vue'
import TimesheetListDisplay from '../components/TimesheetListDisplay.vue'

import { ref } from 'vue'

import { useGoogleUserData } from '../stores/useDataStore'

const { id, isUserLoggedIn } = useGoogleUserData()

const state = ref<'allTimesheets' | 'editTimesheet'>('allTimesheets')

const x = ref(null)

const getUserdata = () => {
  if (isUserLoggedIn()) {
    axios.get(`/api/timesheets/user/${id}`)
    .then(response => {
      const { data } = response
      x.value = data
    })
    .catch(error => {
      console.error('Error fetching data:', error.message)
    })
  }
}

getUserdata()
</script>