<template>
  <div>
    <v-card
      elevation="1"
      class="h-16 rounded-0"
    >
      <div
        :class="`h-16 d-flex ${ xs ? 'justify-space-between' : '' } align-center`"
      >
        <v-avatar
          v-if="mdAndUp"
          class="mx-10"
          size="x-large"
          color="info"
          icon="mdi-clock-outline"
        ></v-avatar>
        <v-btn
          v-if="smAndDown"
          @click="showDrawer = !showDrawer"
          class="mx-4"
          flat
          icon="mdi-menu">
        </v-btn>
        
        <Teleport to="body">
          <v-navigation-drawer
            v-model="showDrawer"
            location="bottom"
            temporary
            class="h-75"
          >
            <v-list class="mx-6">
              <v-list-item class="d-flex justify-center my-4">
                <v-avatar
                  size="x-large"
                  color="info"
                  icon="mdi-clock-outline"
                ></v-avatar>
              </v-list-item>
              <p
                class="text-overline"
                :style="{
                  color: textPrimary,
                }"
              >Navigation</p>
              <v-divider></v-divider>
              <v-list-item 
                v-for="localRoute in router.getRoutes()"
                :key="localRoute.path"
                @click="navLinkClick(localRoute)"
                flat
                class="my-2 rounded-lg"
                prepend-icon="_"
                :style="{
                  background: localRoute.path === currentRoute ? gray : '',
                  color: localRoute.path === currentRoute ? textSelected : textPrimary,
                }"
              >
                {{ String(localRoute.name).replace(/^\w/, (c) => c.toUpperCase()) }}
              </v-list-item>
              <v-divider></v-divider>
              <p
                class="text-overline"
                :style="{
                  color: textPrimary,
                }"
              >Profile</p>
               <v-list-item 
                  v-if="xs"
                  class="my-2"
                  prepend-icon="mdi-account"
                  :style="{
                    color: textPrimary,
                  }"
                >Account</v-list-item>
              <v-list-item 
                v-if="xs"
                class="my-2"
                prepend-icon="mdi-bell"
                :style="{
                  color: textPrimary,
                }"
              >Notifications</v-list-item>
             
              <v-list-item 
                v-if="xs"
                @click="showDialog(true, TestComponent, {}, {})"
                class="my-2"
                prepend-icon="mdi-cog"
                :style="{
                  color: textPrimary,
                }"
              >Settings</v-list-item>
              <v-list-item
                @click="handleNavDrawerLogInOutClick()"
                :style="{
                  color: textPrimary
                }"
                :prepend-icon="googleProfileData.id ==='' ? 'mdi-login' : 'mdi-logout'"
              >{{ `Log ${googleProfileData.id === '' ? 'In' : 'Out'}` }}</v-list-item>
            </v-list>

          </v-navigation-drawer>
        </Teleport>
      
        <div 
          v-if="mdAndUp"
        >
          <v-btn 
            v-for="localRoute in router.getRoutes()"
            :key="localRoute.path"
            @click="navLinkClick(localRoute)"
            flat
            class="ma-2"
            :style="{
              background: localRoute.path === currentRoute ? gray : '',
              color: localRoute.path === currentRoute ? textSelected : textPrimary, 
            }"
          >
            {{ localRoute.name }}
          </v-btn>
        </div>
        <v-spacer v-if="smAndUp">
        </v-spacer>
        <v-btn
          v-if="smAndUp"
          class="mx-5 w-32"
          :style="{ 
            background: blue, 
            color: white,
          }"
          prepend-icon="mdi-plus"
        >New</v-btn>
        <v-btn
          v-else
          class="mx-5"
          :style="{ 
            background: blue, 
            color: white,
          }"
          icon="mdi-plus"
        ></v-btn>
        <v-btn
          v-if="smAndUp && googleProfileData.id"
          size="small" 
          flat 
          icon="mdi-bell-outline"
          :style="{
            color: textPrimary,
          }"
        ></v-btn>
        <v-btn
          v-if="googleProfileData.id === ''"
          @click="redirectToGoogleAuth()"
          flat
          class="mr-4"
          prepend-icon="mdi-login"
        >Log In</v-btn>

        <UserAuthMenu />
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { useDisplay } from 'vuetify'
import { useColorPalette, useDialog } from '../stores/useUserInterfaceStore'
import { useGoogleUserData } from '../stores/useDataStore'

import TestComponent from './TestComponent.vue'
import UserAuthMenu from './UserAuthMenu.vue'

const { smAndDown, mdAndUp, smAndUp, xs } = useDisplay()
const { gray, blue, white, textPrimary, textSelected } = useColorPalette()
const { getGoogleUserData, redirectToGoogleAuth, logUserOut, logUserIn } = useGoogleUserData()
const { showDialog } = useDialog()


const keepUserLoggedIn = ref(!localStorage.getItem('googleProfileData'))

const googleProfileData = computed(() => {
  return getGoogleUserData()
})

const deleteLocalLoginData = () => {
  try {
    localStorage.removeItem('googleProfileData')
  } catch (error) {
    console.error('Error deleting variable from localStorage:', error)
  }
}


const router = useRouter()
const route = useRoute()
const currentRoute = computed(() => {
  return route.path
})

const navLinkClick = (route: RouteRecordRaw) => {
  router.push(route.path)
}

const showProfileMenu = ref(false)
const showDrawer = ref(false)

const handleNavDrawerLogInOutClick = () => {
  if (googleProfileData.value.id === '') redirectToGoogleAuth() 
  else {
    deleteLocalLoginData()
    logUserOut()
  }

  showDrawer.value = false
  
}

const saveLoginDataLocally = () => {
  try {
    localStorage.setItem('googleProfileData', JSON.stringify(googleProfileData.value))
  } catch (error) {
      console.error('Error writing variable to localStorage:', error)
  }
}


</script>