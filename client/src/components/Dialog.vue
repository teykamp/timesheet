<template>
  <v-sheet class="pa-5">
    <h1>
      {{ dialog.body.title }}
    </h1>
    <p class="my-3">
      {{ dialog.body.description }} dshajkdshkjdshakjdksa
    </p>
    <v-btn 
      v-for="button in dialog.body.buttons" 
      :key="button.text" 
      @click="button.onClick" 
      :color="button.color"
    >
      {{ button.text }}
    </v-btn>
  </v-sheet>
</template>

<script setup lang="ts">
import { useDialog } from '../stores/useUserInterface'

const dialog = useDialog()
</script>