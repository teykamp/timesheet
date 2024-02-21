<template>
  <div style="min-height: 500px;">
    <IsContentLoadingWrapper :displayCondition="!(areTimesheetNotesLoading)"/>
      <v-expansion-panels variant="accordion">
        <v-expansion-panel
          v-for="note in timesheetNotes"
          :key="note.noteid"
        >
          <v-expansion-panel-title>
            <v-icon icon="mdi-comment-outline"></v-icon>
              <p class="ml-3">{{ computeNoteTitle(note) }}</p>
            <template v-slot:actions="{ expanded }">
              <v-icon 
                v-if="note.requireresubmit"
                color="warning" 
                icon="mdi-alert-circle"
              ></v-icon>
              <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon>
            </template>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-card flat class="py-6">
                <v-alert
                    v-if="note.requireresubmit"
                    density="compact"
                    type="warning"
                    variant="tonal"
                    text="Timesheet Requires Resubmission"
                    class="mb-2"
                  ></v-alert>
                <v-card-title>
                  Comments:
                </v-card-title>
                <v-card-text>
                  {{ note.commentbody || "No Comments Provided" }}
                </v-card-text>
                <v-chip v-if="note.incorrecthours" 
                  prepend-icon="mdi-alert-circle-outline"
                  size="small" 
                  color="error" 
                  variant="tonal" 
                  label
                >Hours</v-chip>
                <v-chip v-if="note.incorrectproject"
                  prepend-icon="mdi-alert-circle-outline" 
                  size="small" 
                  color="error" 
                  variant="tonal" 
                  label
                >Project</v-chip>
                <v-chip v-if="note.incorrecttime" 
                  prepend-icon="mdi-alert-circle-outline"
                  size="small" 
                  color="error" 
                  variant="tonal" 
                  label
                >Time</v-chip>
              </v-card>
            </v-expansion-panel-text>
          </v-expansion-panel>
      </v-expansion-panels>
    <div v-if="!areTimesheetNotesLoading && timesheetNotes.length === 0">
      No Timesheet Notes
    </div>
    <div class="position-absolute bottom-8 d-flex">
      <v-btn
        v-if="timesheetDisplayStatus !== 'review' && currentRouteName === 'admin'"
        @click="showDialog(true, CreateTimesheetNote, componentProps)"
        prepend-icon="mdi-comment-plus-outline"
        class="mx-3"
      >New Comment</v-btn>
      <v-btn
        @click="openTimesheetFromExternal(props.componentProps.timesheet, computeEmployeeResubmitStatus ? 'edit' : 'view', computeViewerStatus), closeDialog()"
        class="mx-3"
        prepend-icon="mdi-arrow-right"
      >Go To Timesheet</v-btn>
      <v-btn
        @click="closeDialog()"
        class="mx-3"
        color="red"
      >Close</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import CreateTimesheetNote from './CreateTimesheetNote.vue'
import IsContentLoadingWrapper from './IsContentLoadingWrapper.vue'

import axios from 'axios'
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import { useDialog } from '../stores/useUserInterfaceStore'
import { useHandleTimesheetDisplay } from '../stores/useDataStore'
import type { TimesheetNote, Timesheet } from '../types/types'

const { showDialog, closeDialog } = useDialog()
const { openTimesheetFromExternal } = useHandleTimesheetDisplay()
const { timesheetDisplayStatus } = storeToRefs(useHandleTimesheetDisplay())
const route = useRoute()
const currentRouteName = computed(() => route.name)

const props = defineProps<{
  componentProps: { timesheet: Timesheet }
}>()

const timesheetNotes = ref<(TimesheetNote & { noteid: number })[]>([])
const areTimesheetNotesLoading = ref(false)

const computeEmployeeResubmitStatus = computed(() => timesheetNotes.value.some(note => note.requireresubmit) && currentRouteName.value !== 'admin')

const computeViewerStatus = computed(() => {
  switch (currentRouteName.value) {
    case 'admin':
      return 'manager'
    case 'timesheets': return 'employee'
    default: return undefined
  }
})

const computeNoteTitle = (timesheetNote: TimesheetNote) => {
  const { incorrecthours, incorrectproject, incorrecttime, requireresubmit } = timesheetNote
  const appendUrgent = requireresubmit ? ' (Urgent)' : ''
  return incorrecthours || incorrectproject || incorrecttime ? 'Timesheet Update Request' + appendUrgent : 'Timesheet Comment' + appendUrgent
}

const fetchTimesheetNotes = async () => {
  areTimesheetNotesLoading.value = true
  try {
    const response = await axios.get(`/api/timesheetNotes/${props.componentProps.timesheet.timesheetid}`);
    const { data } = response;
    timesheetNotes.value = data;
    areTimesheetNotesLoading.value = false;
  } catch (error) {
    if (error.response.status === 404) {
      console.log('TimesheetNote not found');
      areTimesheetNotesLoading.value = false
    } else {
      console.error('Error retrieving TimesheetNote:', error);
    }
  }
}

fetchTimesheetNotes()
</script>