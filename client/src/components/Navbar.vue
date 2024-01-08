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

        <v-menu
          v-if="googleProfileData.id !== ''"
          v-model="showProfileMenu"
          :close-on-content-click="false"
          location="end"
        >
        <!-- this should create a dialog from the bottom on mobile -->
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              flat 
              v-bind="props"
              :class="`ml-4 ${smAndUp ? 'mr-10' : 'mr-4'}`"
            >
              <v-avatar>
                <v-img
                  :src="googleProfileData.picture"
                  alt=""
                ></v-img>
              </v-avatar>
            </v-btn>
          </template>
      
          <!-- menuBox -->
          <v-card
            class="pa-4" 
            :style="{
              width: '300px'
            }"
          >
            <v-list>
              <v-list-item
                :prepend-avatar="googleProfileData.picture"
                :title="googleProfileData.name"
              >
                <template v-slot:append>
                    <v-btn
                      @click="showDialog(true, TestComponent, {}, {})"
                      flat
                      icon="mdi-cog"
                    ></v-btn>
                  </template>
              </v-list-item>
              <v-list-item>
                <v-switch
                  @change="updateLocalLoginData()"
                  v-model="keepUserLoggedIn"
                  color="purple"
                  label="Stay Logged In"
                  ></v-switch>
              </v-list-item>

            </v-list>
            <v-divider></v-divider>
            <v-card-actions>
              <v-btn
                @click="showProfileMenu = false, deleteLocalLoginData(), logUserOut() /*, googleProfileData = getGoogleUserData() */"
                variant="text"
                prepend-icon="mdi-logout"
              >Log Out</v-btn>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                @click="showProfileMenu = false"
              >Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
        <!-- end menuBox -->
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

const { smAndDown, mdAndUp, smAndUp, xs } = useDisplay()
const { gray, blue, white, textPrimary, textSelected } = useColorPalette()
const { getGoogleUserData, redirectToGoogleAuth, logUserOut, logUserIn } = useGoogleUserData()
const { showDialog } = useDialog()

const checkIfKeepLoggedIn = () => {
  try {
    const googleProfileData = localStorage.getItem('googleProfileData')
    return googleProfileData !== null
  } catch (error) {
    console.error('Error retrieving variable from localStorage:', error)
    return false;
  }
}

const keepUserLoggedIn = ref(checkIfKeepLoggedIn())

const googleProfileData = computed(() => {
  return getGoogleUserData()
})

onMounted(() => {
  if (keepUserLoggedIn.value) logUserIn(loadLocalLoginData())
})

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

const updateLocalLoginData = () => {
  if (keepUserLoggedIn.value) saveLoginDataLocally()
  else deleteLocalLoginData()

}

const saveLoginDataLocally = () => {
  try {
    localStorage.setItem('googleProfileData', JSON.stringify(googleProfileData.value))
  } catch (error) {
      console.error('Error writing variable to localStorage:', error)
  }
}

const deleteLocalLoginData = () => {
  try {
    localStorage.removeItem('googleProfileData')
  } catch (error) {
    console.error('Error deleting variable from localStorage:', error)
  }
}

const loadLocalLoginData = () => {
  try {
    const localLoginData = localStorage.getItem('googleProfileData')
    if (localLoginData) return JSON.parse(localLoginData)
    else return getGoogleUserData()

  } catch (error) {
    console.error('Error retrieving variable from localStorage:', error)
    return getGoogleUserData()
  }
}
</script>