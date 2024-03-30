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
            if (!userAllowSaveCookies) showSnackbar('You do not have cookies enabled so your alias will not be saved between sessions.', 'warning', { text: 'Enable', onClick: () => {
              showDialog(false, UserSettings, undefined, undefined, { 'max-width': '400px' })
            }})
          }"
          :disabled="!alias.projectname || initialValue?.projectname === alias.projectname && initialValue?.projectid === alias.projectid"
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
import { storeToRefs } from 'pinia'
import { useDialog, useSnackbar } from '../stores/useUserInterfaceStore'
import { useHandleUserSettings } from '../stores/useDataStore'
import type { Project, ProjectAlias } from '../types/types'
import UserSettings from './UserSettings.vue'

const { closeDialog, showDialog } = useDialog()
const { showSnackbar } = useSnackbar()
const { userAllowSaveCookies } = storeToRefs(useHandleUserSettings())

const props = defineProps<{
  componentProps: { 
    projects: Project[],
    onSubmitClick: (newAlias: ProjectAlias) => void,
    initialAliasValue?: ProjectAlias,
  }
}>()

const initialValue = {...props.componentProps.initialAliasValue}

const getDate = () => Date.now()

const alias = ref<ProjectAlias>(props.componentProps.initialAliasValue ?? {
  projectname: '',
  projectid: props.componentProps.projects[0].projectid ?? 0, // what if no projects?
  aliasId: getDate(),
})
</script>
