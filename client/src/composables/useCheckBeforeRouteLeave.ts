import { onBeforeRouteLeave } from 'vue-router'

let dialogOpen = false

export const useDataStatus = (validateRequireUserAction: () => boolean) => {
  onBeforeRouteLeave(() => {
    if (dialogOpen) return true

    if (validateRequireUserAction()) return true

    const answer = window.confirm('Do you really want to leave? You have unsaved changes!')

    if (!answer) {
      dialogOpen = false
      return false
    } else {
      dialogOpen = true 
      return true
    }
  })
}