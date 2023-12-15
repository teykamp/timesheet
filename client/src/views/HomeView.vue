<style>
  * {box-sizing: border-box;}

body {
  font-family: Arial;
  padding: 10px;
  background: #ffffff;
}

.mainBody {   
  float: left;
  width: 80%;
}

.rightSide {
  float: left;
  width: 20%;
  background-color: #ffffff;
  padding-left: 20px;
}

.placeholder {
  background-color: #dedede;
  width: 100%;
  padding: 25px;
  text-align: center;
}

.floater {
  background-color: white;
  padding: 20px;
}

.row::after {
  content: "";
  display: table;
  clear: both;
}

.footer {
  padding: 20px;
  text-align: left;
  background: #ffffff;
}

hr {
  height: 2px;
  border: none;
  background-color: #dedede;
  margin-top: 0px
}
</style>

<template>
  

  <div class="row">

<div class="mainBody">
  <div class="floater">
    <div>
    <button @click="redirectToGoogleAuth"><b>Click Here to Sign In</b></button>
    <div v-if="userProfile">
      <p>User Profile:</p>
      <pre>{{ userProfile }}</pre>
    </div>
  </div>
    <div class="placeholder" style="height:300px;">PLACEHOLDER IMAGE</div>
    <p>Timesheet is a versatile application for management of stuff and things</p>
    </div>
</div>

<div class="rightSide">
  <div class="floater">
    <div class="placeholder" style="height:400px; margin-top: 0px;">PLACEHOLDER IMAGE</div>
  </div>
</div>

</div>

<div class="footer">
<hr>
<p>eykamp and shotgunfacelift on GitHub</p>
</div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

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
      } catch (error) {
        console.error('Error fetching user profile data', error.response.data);
      }
    } catch (error) {
      console.error('Error exchanging authorization code for access token', error.response.data);
    }
  }
});
</script>