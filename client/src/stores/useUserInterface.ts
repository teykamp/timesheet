import { defineStore } from 'pinia'

export const useColorPalette = defineStore('colors',{
	state: () => ({
		white: '#ffffff',
		black: '#000000',
		gray: '#dedede',
		blue: '#3b97fc',
		blueShadow: '#0f63ca',
		green: '#24c834',
		greenShadow: '#1d9e2b',
		greenInner: '#9df2a7',
		greenOuter: '#1d9e2b',
		red: '#ff2e2e',
		redInner: '#ff8888',
		redOuter: '#bb0000'
	}),
    
	actions: {

	}		
})

export const useSnackbar = defineStore('snackbar', {
  state: () => ({
    show: false,
    text: '',
    color: ''
  }),
  
  actions: {
    showSnackbar(text: string, color: string = '') {
      this.show = true
      this.text = text
      this.color = color
    },
  }
})

export type Button = {
  text: string;
  onClick: () => void;
  color?: string;
}

type DialogBody = {
  title?: string
  description?: string
  buttons?: Button[]
}

export const useDialog = defineStore('dialog', {
  state: () => ({
    show: false,
    body: {
      title: '',
      description: '',
      buttons: [],
	  },
    persistent: false,
  }),

  actions: {
    showDialog(persistent: boolean = false, body: DialogBody ) {
      this.show = true
      this.body.title = body.title || ''
      this.body.description = body.description || ''
      this.body.buttons = body.buttons || []
      this.persistent = persistent
    },
  }
})