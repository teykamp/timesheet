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
  // load all comments
}
// showdialog with create new comment
</script>