import { defineStore } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import axios from 'axios'

import type { 
  TimesheetDisplayStatus,
   TimesheetStateTypes,
   GoogleProfile,
   Timesheet,
   ManagerTimesheet,
   Row,
   Entry, 
   TimeTable,
} from '../types/types'

export const useHandleUserSettings = defineStore('handleUserSettings', () => {
  // have tooltip if this is false prompting to save aliases
  const userAllowSaveCookies = ref(false)

  const handleManageSettingsData = () => {
    localStorage.setItem(`settings-${useGoogleUserData.$id}`, JSON.stringify(userAllowSaveCookies.value))
  }

  return {
    handleManageSettingsData, 

    userAllowSaveCookies,
  }
})

// this needs a rename
export const useHandleManagerTimesheets = defineStore('handleManagerTimesheets', () => {

  const route = useRoute()

  const managerTimesheets = ref<ManagerTimesheet[]>([])

  const updateTimesheetStatus = async (timesheetOrId: Timesheet | number | null, status: Timesheet['status'], updateUICallback?: () => void) => {
    if (!timesheetOrId) return
    const timesheetId = typeof(timesheetOrId) === 'number' ? timesheetOrId : timesheetOrId.timesheetid
    try {
      const response = await axios.put(`/api/timesheets/${timesheetId}/status`, { status })

      if (route.name === 'admin') { // this is currently only for createtimesheetnote... need better way to determine this since doesnt actually check anything for current usecase
        if (response.status === 200) { // return responsData sometime maybe?
          const responseData = response.data
          const indexToUpdate = managerTimesheets.value.findIndex(managerTimesheet => managerTimesheet.timesheetid === responseData.timesheetid)
          if (indexToUpdate !== -1) {
            responseData.totalHours = managerTimesheets.value[indexToUpdate].totalHours
            responseData.email = managerTimesheets.value[indexToUpdate].email
            managerTimesheets.value[indexToUpdate] = responseData
          }
        } else {
          console.error('Unexpected status:', response.status)
        }
      }
      if (updateUICallback) updateUICallback()
      return response
    } catch (error) {
      console.error('Error updating timesheet status:', error)
    }
  }

  return {
    updateTimesheetStatus,
    managerTimesheets,
  }
})

export const useHandleTimesheetDisplay = defineStore('handleTimesheetDisplay', () => {
  const router = useRouter()
  
  const timesheetDisplayStatus = ref('')
  const currentEditTimesheet = ref<Timesheet | null>(null)
  const timesheetViewState = ref<TimesheetStateTypes>('allTimesheets')

  function resetTimesheetDisplay() {
    timesheetDisplayStatus.value = ''
    currentEditTimesheet.value = null
    updateTimesheetViewState('allTimesheets')
  }

  function setTimesheetDisplayStatus(status: TimesheetDisplayStatus) {
    timesheetDisplayStatus.value = status
  }

  function setCurrentTimesheet(timesheet: Timesheet) {
    currentEditTimesheet.value = timesheet
  }

  function openTimesheetFromExternal(timesheet: Timesheet, status: TimesheetDisplayStatus, accessLevel: 'manager' | 'employee' = 'employee') {
    if (accessLevel === 'employee') {
      router.push({ name: 'timesheets' })
      resetTimesheetDisplay()
      setTimesheetDisplayStatus(status)
    } else setTimesheetDisplayStatus('view')

    setCurrentTimesheet(timesheet)
    updateTimesheetViewState('singleTimesheet')
  }

  function updateTimesheetViewState(newState: TimesheetStateTypes) {
    timesheetViewState.value = newState
  }

  return {
    timesheetDisplayStatus,
    timesheetViewState,
    currentEditTimesheet,

    resetTimesheetDisplay,
    setTimesheetDisplayStatus, 
    setCurrentTimesheet,
    openTimesheetFromExternal,
    updateTimesheetViewState,
  }
})

export const useSingleTimesheetDisplay = defineStore('singleTimesheetDisplay', () => {

  const computeColumnStyles = (index: number) => {
    return {
      'min-width': index === 0 ? '200px' : '50px',
      'max-width': index === 0 ? '500px' : '150px'
    }
  }

  // display default
  const rows = 3
  const cols = 6

  const generateTimeTable = (): TimeTable => 
    Array.from({ length: rows }, () => {
      const row: (Row | Entry)[] = []
        row.push({ projectid: null })
        for (let i = 1; i < cols; i++) {
          row.push({ entry: { projectid: null, hoursWorked: 0, date: null } })
        }
        return row
      })

                                  
  const timesheetData = ref(generateTimeTable())
  const emptyTimesheet = timesheetData.value

  const isTimesheetEmpty = () => {
    return JSON.stringify(emptyTimesheet) === JSON.stringify(timesheetData.value)
  }

  const resetTimesheetData = () => timesheetData.value = generateTimeTable()
                                  
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

  return {
    timesheetData,
    allRulesPassed,

    handleDeleteRow,
    handleAddRow,
    computeColumnStyles,
    validateAllRules,
    resetTimesheetData,
    isTimesheetEmpty,
  }
})

export const useGoogleUserData = defineStore('googleUserData', {
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