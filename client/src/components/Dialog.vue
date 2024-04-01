<template>
  <!-- needs to become full width and bottom on mobile -->
  <v-sheet 
    class="pa-6"
  >
    <h1>
      {{ body.title }}
    </h1>
    <p class="my-3">
      {{ body.description }}
    </p>
    <component
      :is="component" 
      :componentProps="componentProps"
    ></component>
    <v-btn 
      v-for="button in body.buttons" 
      :key="button.text" 
      @click="button.onClick" 
      :color="button.color"
      :variant="button.variant ?? (button.text ? 'text' : 'tonal')"
      :prepend-icon="button.icon?.location === 'prepend' ? button.icon?.icon : undefined"
      :append-icon="button.icon?.location === 'append' ? button.icon?.icon : undefined"
      :icon="button.icon?.location === undefined ? button.icon?.icon : undefined"
      :text="button.text ?? ''"
    >
    </v-btn>
  </v-sheet>
</template>

<script setup lang="ts">
import { useDialog } from '../stores/useUserInterfaceStore'

const { component, componentProps, body } = useDialog()
</script>