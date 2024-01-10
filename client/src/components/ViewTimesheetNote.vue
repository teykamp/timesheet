<template>
  <div>
    <v-btn
      @click="showDialog(true, CreateTimesheetNote, componentProps)"
      prepend-icon="mdi-comment-plus-outline"
    >New Comment</v-btn>
    <v-btn
      @click="closeDialog()"
      color="red"
  >Close</v-btn>
  {{ timesheetNotes }}
  </div>
</template>

<script setup lang="ts">
import CreateTimesheetNote from './CreateTimesheetNote.vue'

import axios from 'axios'
import { ref } from 'vue'

import { useDialog } from '../stores/useUserInterfaceStore'
import type { TimesheetNote } from '../types/types'

const { showDialog, closeDialog } = useDialog()

const props = defineProps<{
  componentProps: { timesheetId: number }
}>()

const timesheetNotes = ref<TimesheetNote[]>([])


const fetchTimesheetNotes = () => {
  axios.get(`/api/timesheetNotes/${props.componentProps.timesheetId}`)
    .then(response => {
      const { data } = response
      timesheetNotes.value = data
    })
    .catch(error => {
      if (error.response.status === 404) {
        console.log('TimesheetNote not found');
      } else {
        console.error('Error retrieving TimesheetNote:', error.response.data.error);
      }
    });
}

fetchTimesheetNotes()
// showdialog with create new comment
</script>