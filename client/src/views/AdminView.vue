<template>
  <div>{{ stuff }}</div>
  <!-- <v-data-table
    :items="userTimesheets"
    :items-per-page="-1"
    :headers="headerData"
    :search="search"
    >
    <template #item.enddate="{ item }">
      <div>
        {{ formatDateToDDMMYY(new Date(item.enddate)) }}
      </div>
    </template>
    <template #item.status="{ item }">
      <div>
        <v-chip
          :color="getStatusChipColor(item.status)"
          :text="item.status"
          class="text-uppercase"
          label
          size="small"
        ></v-chip>
      </div>
    </template>
  
    <template #item.view="{ item }">
      <v-btn
        @click="viewTimesheet(item)"
        flat
        size="small"
        prepend-icon="mdi-eye"
      >View</v-btn>
    </template>
  
    <template #item.actions="{ item }">
      <div class="d-flex justify-end">
        <v-btn
          @click="editTimesheet(item)"
          icon="mdi-pencil"
          class="mr-1"
          variant="tonal"
          size="small"
          :disabled="item.status === 'approved'"
        ></v-btn>
        <v-btn
          @click="deleteTimesheet(item)"
          icon="mdi-delete"
          class="ml-1"
          variant="tonal"
          size="small"
          color="red"
          :disabled="item.status === 'approved'"
        ></v-btn>
      </div>
    </template>
    <template #bottom></template>
  </v-data-table> -->
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'

import headerData from '../functions/headerData'

const stuff = ref(null)

const managerId = '115112513480272962705'

const getStuff = () => {
  axios.get(`/api/timesheets/manager/${managerId}`)
    .then(response => {
      const { data } = response
      console.log(data)
      stuff.value = data
      // stuff.value = data.reverse()
    })
    .catch(error => {
      console.error('Error fetching data:', error.message)
    })
}

getStuff()
</script>