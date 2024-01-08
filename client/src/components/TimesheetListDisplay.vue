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
                <v-chip
                  :color="getStatusChipColor(item.status)"
                  :text="item.status"
                  class="text-uppercase"
                  label
                  size="small"
                ></v-chip>
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
                <v-tooltip
                  v-for="button in timesheetListDisplayActions"
                  :key="button.key"
                  :text="typeof button.tooltip === 'string' ? button.tooltip : button.tooltip(item)"
                  location="top"
                >
                  <template v-slot:activator="{ props }">
                    <v-btn
                      @click="button.callback(item)"
                      v-bind="props"
                      :color="typeof button.color === 'string' ? button.color : button.color(item)"
                      :disabled="button.disabled(item)"
                      :icon="typeof button.icon === 'string' ? button.icon : button.icon(item)"
                      size="small"
                      variant="tonal"
                      class="mr-1"
                    ></v-btn>
                  </template>
                </v-tooltip>
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

import type { Timesheet, HeaderItem } from '../types/types'

import { formatDateToDDMMYY } from '../functions/dateUtils'


const useLoadingScreenStore = useLoadingScreen()
const { isTimesheetListLoading } = storeToRefs(useLoadingScreenStore)

const { xs } = useDisplay()

const props = defineProps<{
  viewTimesheet: (timesheet: Timesheet) => void
  timesheetListDisplayActions: {
    [key: string]: {
      key: string,
      tooltip: string | ((timesheet: Timesheet) => string),
      callback: (timesheet: Timesheet) => void,
      icon: string | ((timesheet: Timesheet) => string),
      color: string | ((timesheet: Timesheet) => string),
      disabled: (timesheet: Timesheet) => boolean
    }
  },
  fetchData: () => void,
  userTimesheets: Timesheet[],
  headerData: HeaderItem[],
}>()

const getStatusChipColor = (status: Timesheet['status']) => {
  switch (status) {
    case 'working':
      return 'primary'
    case 'submitted':
      return 'warning'
    case 'approved':
      return 'success'
    case 'revise':
      return 'error'
  }
}

props.fetchData()

const search = ref('')
</script>