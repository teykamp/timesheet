<template>
  <v-app>
    <Navbar />
    <RouterView />
    <v-snackbar 
      v-model="isSnackbarVisible" 
      :timeout="3000" 
      :color="snackbarColor"
      style="font-family: Roboto Slab;"
    >
    {{ snackbarText }}
    <v-btn 
      v-if="snackbarButton"
      @click="snackbarButton.onClick"
      variant="text"
    >{{ snackbarButton.text }}</v-btn>
    </v-snackbar>
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

const { isSnackbarVisible, snackbarButton, snackbarColor, snackbarText } = storeToRefs(useSnackbar())
const { show, persistent, dialogStyles } = storeToRefs(useDialog())
</script>