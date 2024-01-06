import { defineStore } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import axios from 'axios'

import type { TimesheetDisplayStatus, TimesheetStateTypes, GoogleProfile } from '../types/types'

export const useHandleTimesheetDisplay = defineStore('handleTimesheetDisplay', () => {
  const router = useRouter()
  
  const timesheetDisplayStatus = ref('')
  const currentEditTimesheet = ref(-1)
  const timesheetViewState = ref<TimesheetStateTypes>('allTimesheets')

  function resetTimesheetDisplay() {
    timesheetDisplayStatus.value = ''
    currentEditTimesheet.value = -1
  }

  function setTimesheetDisplayStatus(status: TimesheetDisplayStatus) {
    timesheetDisplayStatus.value = status
  }

  function setCurrentTimesheet(timesheetId: number) {
    currentEditTimesheet.value = timesheetId
  }

  function openTimesheetFromExternal(timesheetId: number, status: TimesheetDisplayStatus) {
    router.push({ name: 'timesheets' })
    resetTimesheetDisplay()
    setTimesheetDisplayStatus(status)
    setCurrentTimesheet(timesheetId)
    updateTimesheetViewState('singleTimesheet')
  }

  function updateTimesheetViewState(newState: TimesheetStateTypes) {
    timesheetViewState.value = newState
  }

  return {
    timesheetDisplayStatus,
    currentEditTimesheet,
    timesheetViewState,

    resetTimesheetDisplay,
    setTimesheetDisplayStatus, 
    setCurrentTimesheet,
    openTimesheetFromExternal,
    updateTimesheetViewState,
  }
})

export const useGoogleUserData = defineStore('googleUserData',{
  state: () => ({
    id: '',
    email: '',
    verified_email: false,
    name: '',
    given_name: '',
    family_name: '',
    picture: '',
    locale: ''
  }), 
  actions: {
    isUserLoggedIn() {
      return this.id !== ''
    },

    logUserIn(googleProfile: GoogleProfile) {
      this.id = googleProfile.id
      this.email = googleProfile.email
      this.verified_email = googleProfile.verified_email
      this.name = googleProfile.name
      this.given_name = googleProfile.given_name
      this.family_name = googleProfile.family_name
      this.picture = googleProfile.picture
      this.locale = googleProfile.locale

      axios.get(`api/users/firstTimeLogin/${this.id}/${encodeURIComponent(this.email)}`)
      .then((response) => {
        console.log('Response: User Logged Back In Successfully');
      })
      .catch((error) => {
        console.error('Error:', error.response.data);
      });
    },

    logUserOut() {
      this.id = ''
      this.email = ''
      this.verified_email = false
      this.name = ''
      this.given_name = ''
      this.family_name = ''
      this.picture = ''
      this.locale = ''
    },

    getGoogleUserData() {
      return {
        id: this.id,
        email: this.email,
        verified_email: this.verified_email,
        name: this.name,
        given_name: this.given_name,
        family_name: this.family_name,
        picture: this.picture,
        locale: this.locale
      }
    },
    
    async redirectToGoogleAuth() {
      try {
        const response = await axios.get('api/auth/url')
        const authUrl = response.data.url
        window.location.href = authUrl
      } catch (error) {
        console.error('Error fetching authentication URL', error.response.data)
      }
    },

    async getGoogleProfileDataFromGoogle() {
      const route = useRoute()
      const authCode = route.query.code

      if (typeof(authCode) === 'string') {
        try {
          const url = `/api/auth/${encodeURIComponent(authCode)}`
          const response = await axios.get(url)

          const accessToken = response.data.access_token;

          try {
            // Use the access token to fetch user profile data
            const profileResponse = await axios.get('/api/user', {
              headers: { Authorization: `Bearer ${accessToken}` }
            })

            this.logUserIn({
              ...profileResponse.data.profileData
            })
          } catch (error) {
            console.error('Error fetching user profile data', error.response.data)
          }
        } catch (error) {
          console.error('Error exchanging authorization code for access token', error.response.data)
        }
      }
    }
  }		
})