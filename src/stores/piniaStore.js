import { defineStore } from 'pinia'

export const usePiniaStore = defineStore('piniaStore', {
  state: () => ({
    token: null
  }),
  actions: {
    setToken(token) {
      this.token = token
    }
  }
})
