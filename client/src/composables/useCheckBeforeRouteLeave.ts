import { onBeforeRouteLeave } from 'vue-router'
import { watch } from 'vue'
import type { Ref } from 'vue'

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

export const useStateStatus = (refToWatch: Ref, validateRequireUserAction: () => boolean) => {
  return watch(refToWatch, () => {
      if (validateRequireUserAction()) return true
      const answer = window.confirm('Do you really want to leave? You have unsaved changes!')
      if (!answer) {
        dialogOpen = false
        return false
      } else {
        dialogOpen = true
        return true
      }
    },
  )
}