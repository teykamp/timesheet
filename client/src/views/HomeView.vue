<template>
  <div 
    :style="{
      height: 'calc(100vh - 80px)',
      overflow: 'auto',
      'flex-wrap': 'wrap',
    }"
    class="d-flex justify-center align-center pa-10"
  >
  <h1 
    :style="computeTitleStyles"
    class="mt-5"
  >{{ text.title }}</h1>
    <v-img
      aspect-ratio="1"
      fit
      :style="{
        'min-width': '60%',
      }"
      :class="{'max-width-60': mdAndDown}"
      src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fglobal-uploads.webflow.com%2F58868bcd2ef4daaf0f072902%2F5bebee0aa80ae83fb5ef5e47_excel-time-sheet-example.png&f=1&nofb=1&ipt=a3c9cc8ae27d32acf2269ddd6adf6915ea3d496b5c3015ebf51ec50601b72d12&ipo=images"
    ></v-img>
  
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import type { StyleValue } from 'vue'
import { useDisplay } from 'vuetify'
import { useGoogleUserData } from '../stores/useDataStore'

const { getGoogleProfileDataFromGoogle } = useGoogleUserData()
const { smAndDown, mdAndDown } = useDisplay()

onMounted(() => {
  getGoogleProfileDataFromGoogle()
})

const text = {
  title: 'Improve the time complexity of your business with Time Tracking!',
}

const computeTitleStyles = computed(() => {
  return {
    fontSize: smAndDown.value ? '2rem' : '3vw',
    'max-width': smAndDown.value ? '100%' : '40%',
    'font-weight': 'bold',
    'padding-left': '5%',
  } as StyleValue
})
</script>