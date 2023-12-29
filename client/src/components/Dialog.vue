<template>
  <!-- needs to become full width and bottom on mobile -->
  <v-sheet class="pa-5">
    <h1>
      {{ body.title }}
    </h1>
    <p class="my-3">
      {{ body.description }}
    </p>
    <component :is="component" :props="componentProps"></component>
    <v-btn 
      v-for="button in body.buttons" 
      :key="button.text" 
      @click="button.onClick" 
      :color="button.color"
    >
      {{ button.text }}
    </v-btn>
  </v-sheet>
</template>

<script setup lang="ts">
// import { storeToRefs } from 'pinia'
import { useDialog } from '../stores/useUserInterfaceStore'

import TestComponent from './TestComponent.vue';

const { component, componentProps, body } = useDialog()
const useDialogStore = useDialog()

// const { componentName, componentProps } = storeToRefs(useDialogStore)

// const componentsMap = {
//   TestComponent,
// }

// const selectedComponent = componentsMap[componentName.value]
</script>