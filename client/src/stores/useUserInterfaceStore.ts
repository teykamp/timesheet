import { defineStore } from 'pinia'
import { markRaw, ref } from 'vue'
import { useRouter } from 'vue-router'
interface LoadingState {
  isTimesheetListLoading: boolean;
  isTimesheetContentLoading: boolean;
}

export type Button = {
  // need to update to accept icons also
  text: string;
  onClick: () => void;
  color?: string;
}

export const useLoadingScreen = defineStore('loading', {
  state: () => ({
    isTimesheetListLoading: true,
    isTimesheetContentLoading: true
  }),

  actions: {
    setLoadingState(variableName: keyof LoadingState, value: boolean) {
      if (this.$state.hasOwnProperty(variableName)) {
        this.$state[variableName] = value
      } else {
        console.warn(`Variable '${variableName}' not found in state.`)
      }
    },
  }
})

export const useColorPalette = defineStore('colors',{
	state: () => ({
		white: '#ffffff',
		black: '#000000',
    textPrimary: '#6b7280',
    textSelected: '#374151',
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

export const useSnackbar = defineStore('snackbar', () => {
  const isSnackbarVisible = ref(false)
  const snackbarText = ref('')
  const snackbarColor = ref('')
  const snackbarButton = ref<undefined | Button>(undefined)

  const showSnackbar = (text: string, color?: string, button?: Button) => {
    isSnackbarVisible.value = true
    snackbarText.value = text
    snackbarColor.value = color ?? ''
    snackbarButton.value = button || {
      text: '',
      onClick: () => {},
      color: undefined,
    }
  }

  return {
    isSnackbarVisible,
    snackbarText,
    snackbarColor,
    snackbarButton,

    showSnackbar,
  }
})


type DialogBody = {
  title?: string
  description?: string
  buttons?: Button[]
}

export const useDialog = defineStore('dialog', () => {
  const router = useRouter()

  const show = ref(false)
  const component = ref('')
  const componentProps = ref({})
  const body = ref<DialogBody>({
    title: '',
    description: '',
    buttons: [] as Button[],
  })
  const persistent = ref(false)
  const dialogStyles = ref({})

  const closeDialog = () => {
    show.value = false
  }

  const showDialog = (
    persistentDialog: boolean, 
    dialogComponent: any, 
    dialogComponentProps?: object, 
    dialogBody?: DialogBody, 
    dialogBodyStyles?: object, 
    route?: string | { path: string }
  ) => {

    const isDialogShowing = show.value
    if (show.value) closeDialog()

    if (route) typeof route === 'string' ? router.push(route) : router.push(route.path)
    setTimeout(() => {
      persistent.value = persistentDialog
      component.value = markRaw(dialogComponent)
      componentProps.value = dialogComponentProps ?? {}
      body.value = dialogBody ?? {}
      body.value.title = dialogBody?.title ?? ''
      body.value.description = dialogBody?.description ?? ''
      body.value.buttons = dialogBody?.buttons ?? []
      dialogStyles.value = dialogBodyStyles || {}
      show.value = true
    }, isDialogShowing ? 400 : 0)
  }

  return {
    show,
    dialogStyles,
    body,
    component,
    componentProps,
    persistent, 

    closeDialog,
    showDialog,
  }
})