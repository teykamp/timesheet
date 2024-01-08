<template>
  <v-card flat>
    <v-card-title>New Timesheet Review</v-card-title>

    <v-card-subtitle>Quick Actions</v-card-subtitle>
    <div class="d-flex justfy-center">
      <v-checkbox label="Incorrect Hours"></v-checkbox>
      <v-checkbox label="Incorrect Project"></v-checkbox>
      <v-checkbox label="Incorrect Time"></v-checkbox>
    </div>

    <v-card-subtitle>Additional Feedback</v-card-subtitle>
    <v-textarea
      auto-grow
      clearable
      rows="4"
      label="Add Comment"
      class="mt-3"
    ></v-textarea>
    <v-switch
      label="Require Resubmit"
      class="ml-4"
      color="orange"
    ></v-switch>
    <v-card-actions class="d-flex justify-center">
      <v-btn
        @click="closeDialog()"
        variant="text"
        color="error"
      >
        Cancel
      </v-btn>
      <v-btn
        @click="handleSubmitClick()"
        variant="text"
        color="success"
      >
        Submit
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { useDialog } from '../stores/useUserInterfaceStore'

const { closeDialog } = useDialog()

const handleSubmitClick = () => {
  // stuff
  // if require resubmit then set timesheet status to reviewed
  closeDialog()
}
</script>