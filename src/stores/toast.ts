import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toastQueue = ref<{ severity: string, summary: string, detail: string }[]>([])

  function showToast(message: string, severity = 'info', summary = 'Info') {
    toastQueue.value.push({ severity, summary, detail: message })
  }

  return { toastQueue, showToast }
})