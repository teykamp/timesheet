import { defineStore } from 'pinia'

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
    }
  }		
})