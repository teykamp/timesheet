<template>
  <v-app>
    <Navbar />
    <RouterView />
    <v-snackbar 
      v-model="snackbar.show" 
      :timeout="3000" 
      :color="snackbar.color"
      style="font-family: Roboto Slab;"
    >{{ snackbar.text }}</v-snackbar>
    <v-dialog
      v-model="show"
      :style="{
        'max-width': '1000px',
        ...dialogStyles
      }"
      :persistent="persistent"
    >
      <Dialog />
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import Dialog from './components/Dialog.vue'
import Navbar from './components/Navbar.vue'
import { storeToRefs } from 'pinia'

import { useSnackbar, useDialog } from './stores/useUserInterfaceStore'

const snackbar = useSnackbar()
const { show, persistent, dialogStyles } = storeToRefs(useDialog())
</script>