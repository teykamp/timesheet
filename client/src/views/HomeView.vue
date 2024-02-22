<template>
  <div>
   
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useGoogleUserData } from '../stores/useDataStore'

const { getGoogleProfileDataFromGoogle } = useGoogleUserData()

onMounted(() => {
  getGoogleProfileDataFromGoogle()
})
</script>