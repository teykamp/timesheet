<template>
    <v-expansion-panels v-for="notification in notifArray">
        <v-expansion-panel :title="`${notification.date} ${notification.from} ${notification.message.slice(0,8)}`"
            :text="notification.projectID">
        </v-expansion-panel>
    </v-expansion-panels>
</template>

# testing

<script setup lang="ts"> 
import { useColorPalette, useDialog } from '../stores/useUserInterfaceStore'
import {computed} from "vue";

type notification = {
    date: string,
    from: string,
    message: string,
    projectID: string // when clicked will redirect to project
}
const notifArray :notification[] = [
    {
        date: "31-12-2023",
        from: "John",
        message: "Timesheet Viewed: Your timesheet have been accepted",
        projectID: "1234"

    },
    {
        date: "30-12-2023",
        from: "John",
        message: "Project Revised: Your project has been revised by your manager.",
        projectID: "1234"

    },
    {
        date: "30-12-2023",
        from: "John",
        message: "Project Assigned: You've been added to project xyz",
        projectID: "1234"

    }
]

const notifcationCount = computed(()=> notifArray.length)
const { gray, blue, white, textPrimary, textSelected, red } = useColorPalette()
</script>
