<template>
  <v-app>
    <NavBar />
    <RouterView />
    <v-snackbar 
      v-model="snackbar.show" 
      :timeout="3000" 
      :color="snackbar.color"
      style="font-family: Roboto Slab;"
    >{{ snackbar.text }}</v-snackbar>
    <v-dialog
      v-model="dialog.show"
      style="max-width: 1000px;"
    >
      <Dialog />
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import Dialog from './components/Dialog.vue'
import NavBar from './components/Navbar.vue'

import { useSnackbar, useDialog } from './stores/useUserInterfaceStore'

const snackbar = useSnackbar()
const dialog = useDialog()
</script>