<template>
  <div style="min-height: 500px;">
    <IsContentLoadingWrapper :displayCondition="!(areTimesheetNotesLoading)"/>
    <!-- list of items with pop-down with more details. can have tags with the three options: hours, project, time and a warning icon if resubmit required -->
    <div v-if="!areTimesheetNotesLoading && timesheetNotes.length === 0">
      No Timesheet Notes
    </div>
    <v-btn
    v-if="timesheetDisplayStatus !== 'review'"
      @click="showDialog(true, CreateTimesheetNote, componentProps)"
      prepend-icon="mdi-comment-plus-outline"
    >New Comment</v-btn>
    <v-btn
      @click="closeDialog()"
      color="red"
  >Close</v-btn>
  </div>
</template>

<script setup lang="ts">
import CreateTimesheetNote from './CreateTimesheetNote.vue'
import IsContentLoadingWrapper from './IsContentLoadingWrapper.vue'

import axios from 'axios'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useDialog } from '../stores/useUserInterfaceStore'
import { useHandleTimesheetDisplay } from '../stores/useDataStore'
import type { TimesheetNote } from '../types/types'

const { showDialog, closeDialog } = useDialog()
const timesheetDisplayStatusStore = useHandleTimesheetDisplay()
const { timesheetDisplayStatus } = storeToRefs(timesheetDisplayStatusStore)

const props = defineProps<{
  componentProps: { timesheetId: number }
}>()

const timesheetNotes = ref<TimesheetNote[]>([])
const areTimesheetNotesLoading = ref(false)

const fetchTimesheetNotes = async () => {
  areTimesheetNotesLoading.value = true
  try {
    const response = await axios.get(`/api/timesheetNotes/${props.componentProps.timesheetId}`);
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