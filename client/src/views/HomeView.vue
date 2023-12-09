<template>
  <div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGoogleUserData } from '../stores/useDataStore'

const { redirectToGoogleAuth, getGoogleProfileData } = useGoogleUserData()

onMounted(() => {
  getGoogleProfileData()
})
</script>