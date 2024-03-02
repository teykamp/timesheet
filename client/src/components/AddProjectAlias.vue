<template>
    <div>
      <!-- prevent clicking from closing menu -->
      <v-text-field
        v-model="alias.projectname"
        label="Alias Title"
      ></v-text-field>
      <v-autocomplete
        v-model="alias.projectid"
        :items="props.componentProps.projects"
        item-title="projectname"
        item-value="projectid"
      ></v-autocomplete>
      <v-btn
        @click="props.componentProps.onAddProjectAliasSubmit(alias), closeDialog()"
        append-icon="mdi-plus"
      >Add</v-btn>
    </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { useDialog } from '../stores/useUserInterfaceStore'
import type { Project, ProjectAlias } from '../types/types'

const { closeDialog } = useDialog()

const props = defineProps<{
  componentProps: { 
    projects: Project[],
    onAddProjectAliasSubmit: (newAlias: ProjectAlias) => void,
  }
}>()

const alias = ref<ProjectAlias>({
  projectname: '',
  projectid: props.componentProps.projects[0].projectid,
  isAlias: true,
})
</script>
