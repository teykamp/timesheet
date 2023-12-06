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

