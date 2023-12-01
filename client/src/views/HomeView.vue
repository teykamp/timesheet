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
import axios from 'axios';
import { ref, onMounted } from 'vue';

const userProfile = ref(null);

const redirectToGoogleAuth = async () => {
  try {
    const response = await axios.get('api/auth/url');
    const authUrl = response.data.url;
    window.location.href = authUrl;
  } catch (error) {
    console.error('Error fetching authentication URL', error.response.data);
  }
};

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get('code')

  if (authCode) {
    try {
      const response = await axios.get(`api/auth/${authCode}`);
      const accessToken = response.data.access_token;

      try {
        const profileResponse = await axios.get('api/user', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        userProfile.value = profileResponse.data.profileData;
      } catch (error) {
        console.error('Error fetching user profile data', error.response.data);
      }
    } catch (error) {
      console.error('Error exchanging authorization code for access token', error.response.data);
    }
  }
});
</script>