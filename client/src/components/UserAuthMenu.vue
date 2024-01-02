<template>
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
                  v-model="KeepLoggedIn"
                  color="purple"
                  label="Stay Logged In"
                  ></v-switch>
              </v-list-item>

            </v-list>
            <v-divider></v-divider>
            <v-card-actions>
              <v-btn
                @click="logOutHandler" 
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
  <!-- diff -->
    
</template>
<script setup lang="ts">
  import { ref, computed, onMounted} from "vue"
  import { useDisplay } from 'vuetify'
  import { useGoogleUserData } from '../stores/useDataStore'
  import { useDialog } from '../stores/useUserInterfaceStore'
  const { getGoogleUserData, logUserOut, logUserIn} = useGoogleUserData()
  const { showDialog } = useDialog()
  const { smAndDown, mdAndUp, smAndUp, xs } = useDisplay();
  
  const googleProfileData = computed(() => {
    return getGoogleUserData()
  })
  const showProfileMenu = ref(false)

  const KeepLoggedIn = ref<any>() // unsure what the switch stores.

  const saveLoginDataLocally = () => {
  try {
    localStorage.setItem('googleProfileData', JSON.stringify(googleProfileData.value))
  } catch (error) {
      console.error('Error writing variable to localStorage:', error)
  }
}

  const checkIfKeepLoggedIn = () => {
    try {
      const googleProfileData = localStorage.getItem('googleProfileData')
      return googleProfileData !== null
    } catch (error) {
      console.error('Error retrieving variable from localStorage:', error)
      return false;
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

  const keepUserLoggedIn = ref(checkIfKeepLoggedIn())

  onMounted(() => {
    if (keepUserLoggedIn.value) logUserIn(loadLocalLoginData())
  })

  const updateLocalLoginData = () => {
  if (keepUserLoggedIn.value) saveLoginDataLocally()
  else deleteLocalLoginData()

  }

  const logOutHandler = () =>{
    showProfileMenu.value = false;
    deleteLocalLoginData();
    logUserOut();
  }

  const deleteLocalLoginData = () => {
  try {
    localStorage.removeItem('googleProfileData')
  } catch (error) {
    console.error('Error deleting variable from localStorage:', error)
  }
}

  
</script>
