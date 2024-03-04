<template>
  <v-switch
    @change="handleManageSettingsData"
    v-model="userAllowSaveCookies"
    label="Allow Cookies"
    color="purple"
  ></v-switch>
  <!-- clear all data button with 'are you sure' -->
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia'
import { useHandleUserSettings } from '../stores/useDataStore'

const { userAllowSaveCookies } = storeToRefs(useHandleUserSettings())
const { handleManageSettingsData } = useHandleUserSettings()
</script>