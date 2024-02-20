<template>
  <v-card flat>
    <v-card-title>New Timesheet Review</v-card-title>

    <v-card-subtitle>Quick Actions</v-card-subtitle>
    <div class="d-flex justfy-center">
      <v-checkbox label="Incorrect Hours" v-model="data.incorrecthours"></v-checkbox>
      <v-checkbox label="Incorrect Project" v-model="data.incorrectproject"></v-checkbox>
      <v-checkbox label="Incorrect Time" v-model="data.incorrecttime"></v-checkbox>
    </div>
    <v-card-subtitle>Additional Feedback</v-card-subtitle>
    <v-textarea
      auto-grow
      clearable
      rows="4"
      label="Add Comment"
      class="mt-3"
      v-model="data.commentbody"
    ></v-textarea>
    <v-switch
      label="Require Resubmit"
      class="ml-4"
      color="warning"
      v-model="data.requireresubmit"
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
        :disabled="computeCanSubmit"
      >
        Submit
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, computed } from 'vue'
import { useDialog } from '../stores/useUserInterfaceStore'
import { useHandleManagerTimesheets } from '../stores/useDataStore'
import type { TimesheetNote } from '../types/types'

const { closeDialog } = useDialog()
const { updateTimesheetStatus } = useHandleManagerTimesheets()

const props = defineProps<{
  componentProps: { timesheetId: number }
}>()

const data = ref<TimesheetNote>({
  timesheetid: props.componentProps.timesheetId,
  incorrecthours: false,
  incorrectproject: false,
  incorrecttime: false,
  commentbody: '',
  requireresubmit: false,
})

const handleSubmitClick = async () => {
  try {
    const response = await axios.post('/api/timesheetNotes', data.value)
    if (data.value.requireresubmit) updateTimesheetStatus(props.componentProps.timesheetId, 'revised')

  } catch (error) {
    console.error('Error creating timesheetNote:', error)
  }

  closeDialog()
}

const computeCanSubmit = computed(() => {
  return !(data.value.incorrecthours || data.value.incorrectproject || data.value.incorrecttime || data.value.commentbody !== '')
})
</script>