<template>
  <v-card
    flat 
    :class="`mt-6 ${xs ? '' : 'px-12'}`"
  >
    <IsContentLoadingWrapper :displayCondition="!isTimesheetListLoading">
      <template #loadedContent>
        <div  
          class="flex flex-col sm:flex-row justify-space-between align-center"
        >
          <v-card flat>
            <template v-slot:title>
              View Timesheets
            </template>
          </v-card>
          <v-card flat>
            <template #text>
              <v-text-field
                v-model="search"
                label="Search"
                prepend-inner-icon="mdi-magnify"
                single-line
                variant="outlined"
                hide-details
                style="max-width: 400px; min-width: 250px;"
              ></v-text-field>
            </template>
          </v-card>
        </div>
        <div style="max-height: calc(88vh - 210px); overflow-y: auto;">
          <v-data-table
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
                @click="timesheetListDisplayActions.viewTimesheet(item)"
                flat
                size="small"
                prepend-icon="mdi-eye"
              >View</v-btn>
            </template>
          
            <template #item.actions="{ item }">
              <div class="d-flex justify-end">
                <v-btn
                  @click="timesheetListDisplayActions.editTimesheet(item)"
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
          </v-data-table>
        </div>
      </template>
    </IsContentLoadingWrapper>
  </v-card>
</template>

<script setup lang="ts">
import IsContentLoadingWrapper from './IsContentLoadingWrapper.vue'

import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'

import { useLoadingScreen } from '../stores/useUserInterfaceStore'
import type { TimesheetStateTypes } from '../stores/useDataStore'

import { formatDateToDDMMYY } from '../functions/dateUtils'
import headerData from '../functions/headerData'
import type { Timesheet } from '../stores/types'

const useLoadingScreenStore = useLoadingScreen()
const { isTimesheetListLoading } = storeToRefs(useLoadingScreenStore)

const { xs } = useDisplay()

const props = defineProps<{
  updateState: (newState: TimesheetStateTypes) => void,
  timesheetListDisplayActions: { [key: string]: (item: Timesheet) => void },
  fetchData: () => void,
  userTimesheets: Timesheet[],
}>()


const getStatusChipColor = (status: Timesheet['status']) => {
  switch (status) {
    case 'working':
      return 'primary'
    case 'submitted':
      return 'orange'
    case 'approved':
      return 'success'
  }
}

props.fetchData()

const search = ref('')
</script>