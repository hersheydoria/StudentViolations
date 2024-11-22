import { defineStore } from 'pinia'

export const usePiniaStore = defineStore('piniaStore', {
  state: () => ({
    sessionToken: null,
    recoveryToken: null
  }),
  actions: {
    setSessionToken(token) {
      this.sessionToken = token
    },
    setRecoveryToken(token) {
      this.recoveryToken = token
    }
  }
})
