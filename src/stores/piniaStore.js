import { defineStore } from 'pinia'

export const usePiniaStore = defineStore('piniaStore', {
  state: () => ({
    recoveryToken: null
  }),
  actions: {
    setRecoveryToken(token) {
      this.recoveryToken = token
    }
  }
})
