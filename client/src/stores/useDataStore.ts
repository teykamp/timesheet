import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import axios from 'axios'


export type GoogleProfile = {
  id: string,
  email: string,
  verified_email: boolean,
  name: string,
  given_name: string,
  family_name: string,
  picture: string,
  locale: string
}

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
    logUserIn(googleProfile: GoogleProfile) {
      console.log(googleProfile)
      this.id = googleProfile.id
      this.email = googleProfile.email
      this.verified_email = googleProfile.verified_email
      this.name = googleProfile.name
      this.given_name = googleProfile.given_name
      this.family_name = googleProfile.family_name
      this.picture = googleProfile.picture
      this.locale = googleProfile.locale
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

    async getGoogleProfileData() {
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