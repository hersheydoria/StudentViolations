import { createApp, reactive } from 'vue'
import { createPinia } from 'pinia'
import { supabase } from '@/stores/supabase'

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const vuetify = createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          customGreen: '#286643'
        }
      }
    }
  },
  icons: {
    defaultSet: 'mdi'
  },
  components,
  directives
})

// Define the reactive authState with isPasswordRecovery flag
export const authState = reactive({
  isAuthenticated: false,
  user: null,
  isPasswordRecovery: false // Add this to track password recovery state
})

// Handle initial session
supabase.auth.getSession().then(({ data: { session } }) => {
  const currentRoute = router.currentRoute.value.name
  console.log('Initial Session:', session)
  console.log('Current route during session restoration:', currentRoute)

  // Skip session restoration if on the reset-password page
  if (currentRoute === 'ResetPassword') {
    console.log('Skipping session restoration because we are on the reset-password page.')
    return
  }

  // Restore session for other routes
  if (session && session.user) {
    authState.isAuthenticated = true
    authState.user = {
      id: session.user.id,
      email: session.user.email,
      fullname:
        `${session.user.user_metadata?.first_name || ''} ${session.user.user_metadata?.last_name || ''}`.trim()
    }
  }
})

// Handle authentication state changes
supabase.auth.onAuthStateChange((event, session) => {
  const currentRoute = router.currentRoute.value.name
  console.log('Auth event:', event, 'Session:', session)
  console.log('Current route during auth state change:', currentRoute)

  switch (event) {
    case 'PASSWORD_RECOVERY':
      console.log('Password recovery event detected.')

      // Set the flag to indicate we are in password recovery state
      authState.isPasswordRecovery = true

      // Redirect to ResetPassword if not already there
      if (currentRoute !== 'ResetPassword') {
        router.push({ name: 'ResetPassword', query: { access_token: session.access_token } })
      }
      break

    case 'SIGNED_IN':
      console.log('User signed in.')

      // Reset the password recovery state on successful login
      authState.isPasswordRecovery = false

      if (currentRoute === 'login') {
        router.push({ name: 'home' })
      }
      break

    case 'SIGNED_OUT':
      console.log('User signed out.')

      // Reset the password recovery state on sign out
      authState.isPasswordRecovery = false

      if (currentRoute !== 'login') {
        router.push({ name: 'login' })
      }
      break

    default:
      console.log(`Unhandled auth event: ${event}`)
  }
})

// Provide authState globally
app.provide('authState', authState)
app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
