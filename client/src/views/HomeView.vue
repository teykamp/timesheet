<template>
  <div>
    <h1>Google Authentication</h1>
    <button @click="redirectToGoogleAuth">Authenticate with Google</button>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'

const redirectToGoogleAuth = () => {
  axios.get('/api/auth/url')
    .then(response => {
      const authUrl = response.data.url
      window.location.href = authUrl
    })
    .catch(error => {
      console.error('Error fetching authentication URL', error.response.data);
    })
}
</script>