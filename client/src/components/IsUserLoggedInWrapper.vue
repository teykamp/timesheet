<template>
  <div>
    <slot 
      v-if="isUserLoggedIn()"
      name="contentIfLoggedIn"
    >

    </slot>
    <slot 
      v-else
      name="contentIfNotLoggedIn"
    >
      <div 
        :style="{
          width: '100%',
          height: '500px',
        }"  
        class="d-flex justify-center align-center"
      >
        <div class="text-center">
          <p class="ma-10">You are not Logged In</p>
          <v-btn
            @click="redirectToGoogleAuth()"
            flat
          >Log In</v-btn>
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useGoogleUserData } from '../stores/useDataStore'

const { isUserLoggedIn, redirectToGoogleAuth } = useGoogleUserData()


</script>