<template>
  <v-card flat>
    <v-card-title>New Timesheet Review</v-card-title>

    <v-card-subtitle>Quick Actions</v-card-subtitle>
    <div class="d-flex justfy-center">
      <v-checkbox label="Incorrect Hours" v-model="data.incorrectHours"></v-checkbox>
      <v-checkbox label="Incorrect Project" v-model="data.incorrectProject"></v-checkbox>
      <v-checkbox label="Incorrect Time" v-mode="data.incorrectTime"></v-checkbox>
    </div>

    <v-card-subtitle>Additional Feedback</v-card-subtitle>
    <v-textarea
      auto-grow
      clearable
      rows="4"
      label="Add Comment"
      class="mt-3"
      v-model="data.commentBody"
    ></v-textarea>
    <v-switch
      label="Require Resubmit"
      class="ml-4"
      color="warning"
      v-model="data.requireResubmit"
    ></v-switch>
    <v-card-actions class="d-flex justify-center">
      <v-btn
        @click="closeDialog()"
        variant="tonal"
        color="red"
      >
        Cancel
      </v-btn>
      <v-btn
        @click="handleSubmitClick()"
        variant="tonal"
      >
        Submit
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDialog } from '../stores/useUserInterfaceStore'
import type { TimesheetNote } from '../types/types'

const { closeDialog } = useDialog()

const handleSubmitClick = () => {
  // stuff
  // if require resubmit then set timesheet status to reviewed
  closeDialog()
}

const data = ref<TimesheetNote>({
  incorrectHours: false,
  incorrectProject: false,
  incorrectTime: false,
  commentBody: '',
  requireResubmit: false,
})
</script>