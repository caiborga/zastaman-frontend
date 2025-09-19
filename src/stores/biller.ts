import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api } from '../api'

export const useBillerStore = defineStore('biller', () => {
  const biller = ref<any>(null)

  async function fetchBiller() {
    try {
      const res = await api.get('/biller')
      biller.value = res.data
    } catch (err) {
      biller.value = null
    }
  }

  const hasBiller = computed(() => !!biller.value)
  
  return { biller, fetchBiller, hasBiller }
})
