import { defineStore } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import axios from 'axios'

import type { TimesheetDisplayStatus, TimesheetStateTypes, GoogleProfile, ArrowDirection } from '../types/types'

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

export const useSingleTimesheetDisplay = defineStore('singleTimesheetDisplay', () => {

  // what needs to happen:
  // need to componentize the grid
  // this means using store for the grid data, meaning all of the actions need to be in the store as well and called from edittimesheet.vue
  // data needs to be storetorefs to make it reactive

  //  ^^^ should all be done

  // afterards, export data in here that has to do with timesheets and make special store
  // maybe can use some stuff from above?? but I think they handle different stuff so lets see


  const computeColumnStyles = (index: number) => {
    return {
      'min-width': index === 0 ? '200px' : '50px',
      'max-width': index === 0 ? '500px' : '150px'
    }
  }

  // display default
  const rows = 3
  const cols = 6

  const timesheetData = ref(
    Array.from({ length: rows }, () => {
      const row = []
      row.push({ projectid: null })
      for (let i = 0; i < cols - 1; i++) {
        row.push({ entry: { projectid: null, hoursWorked: 0, date: null } })
      }
      return row
    })
  )

  const handleDeleteRow = (rowIndex: number) => {
    timesheetData.value.splice(rowIndex, 1);
  }

  const handleAddRow = () => {
    const newRow = []
    newRow.push({ projectid: null })
    for (let i = 0; i < cols - 1; i++) {
      newRow.push({ entry: { projectid: null, hoursWorked: 0, date: null } })
    }
    timesheetData.value.push(newRow)
  }

  const allRulesPassed = ref(false)

  const positiveNumberRule = (value: any) => {
    return /^[+]?\d*\.?\d+$/.test(value) || 'Error NaN'
  }
  const multipleOfQuarterRule = (value: any) => {
    return (parseFloat(value) % 0.25 === 0) || 'Error *.25'
  }
  const validateAllRules = (value: any) => {
    const rules = [positiveNumberRule, multipleOfQuarterRule]
    for (const rule of rules) {
      const result = rule(value)
      if (result !== true) {
        allRulesPassed.value = false
        return false
      }
    }
    allRulesPassed.value = true
    return true
  }

  type SelectedCell = [number, number]

  const currentSelectedCell = ref<SelectedCell | undefined>(undefined)

  const handleMoveCellSelection = (direction: ArrowDirection) => {
    if (!currentSelectedCell.value) return
    switch (direction) {
      case 'ArrowUp':
        if (currentSelectedCell.value[0] === 0) return
        currentSelectedCell.value[0]--
        break
      case 'ArrowDown':
        if (currentSelectedCell.value[0] === timesheetData.value.length - 1) return
        currentSelectedCell.value[0]++
        break
      case 'ArrowLeft':
        if (currentSelectedCell.value[1] === 1) return
        currentSelectedCell.value[1]--
        break
      case 'ArrowRight':
        if (currentSelectedCell.value[1] === timesheetData.value[0].length - 1) return
        currentSelectedCell.value[1]++
        break
    }
  }

  const handleTimesheetCellFocus = (position: SelectedCell) => {
    currentSelectedCell.value = position
  }
  const handleTimesheetCellBlur = () => {
    currentSelectedCell.value = undefined
  }

  return {
    timesheetData,
    handleDeleteRow,
    handleAddRow,
    computeColumnStyles,
    allRulesPassed,
    validateAllRules,
    handleMoveCellSelection,
    handleTimesheetCellFocus, 
    handleTimesheetCellBlur,
    currentSelectedCell,
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
    locale: '',
    isManager: false,
    managerId: -1,
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
        const { data } = response
        this.isManager = data.ismanager
        this.managerId = data.managerid
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
      this.isManager = false
      this.managerId = -1
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

    getUserData() {
      return {
        id: this.id,
        email: this.email,
        isManager: this.isManager,
        managerId: this.managerId
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