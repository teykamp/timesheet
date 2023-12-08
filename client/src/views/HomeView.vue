<template>
  <div>
    <button @click="redirectToGoogleAuth">Authenticate with Google</button>
    <div v-if="userProfile">
      <p>User Profile:</p>
      <pre>{{ userProfile }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { useGoogleUserData } from '../stores/useDataStore'

const googleUserLoginData = useGoogleUserData()

const userProfile = ref(null)

const redirectToGoogleAuth = async () => {
  try {
    const response = await axios.get('api/auth/url')
    const authUrl = response.data.url
    window.location.href = authUrl
  } catch (error) {
    console.error('Error fetching authentication URL', error.response.data)
  }
}

onMounted(async () => {
  const route = useRoute();
  const authCode = route.query.code;

  if (typeof(authCode) === 'string') {
    try {
      const url = `/api/auth/${encodeURIComponent(authCode)}`;
      const response = await axios.get(url);

      const accessToken = response.data.access_token;

      try {
        // Use the access token to fetch user profile data
        const profileResponse = await axios.get('/api/user', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        userProfile.value = profileResponse.data.profileData;
        googleUserLoginData.logUserIn({
          ...profileResponse.data.profileData
        })
      } catch (error) {
        console.error('Error fetching user profile data', error.response.data);
      }
    } catch (error) {
      console.error('Error exchanging authorization code for access token', error.response.data);
    }
  }
});
</script>