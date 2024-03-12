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
      <div class="d-flex justify-center gap-5">
        <v-btn
          @click="() => {
            props.componentProps.onSubmitClick(alias)
            closeDialog()
          }"
          :disabled="!alias.projectname"
          :append-icon="props.componentProps.initialAliasValue ? 'mdi-arrow-right': 'mdi-plus'"
        >{{ props.componentProps.initialAliasValue ? 'Update' : 'Add' }}</v-btn>
        <v-btn  
          @click="closeDialog()"
          color="red"
        >Close</v-btn>
      </div>
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
    onSubmitClick: (newAlias: ProjectAlias) => void,
    initialAliasValue?: ProjectAlias,
  }
}>()

const getDate = () => Date.now()

const alias = ref<ProjectAlias>(props.componentProps.initialAliasValue ?? {
  projectname: '',
  projectid: props.componentProps.projects[0].projectid ?? 0, // what if no projects?
  aliasId: getDate(),
})
</script>
