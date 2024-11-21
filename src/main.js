import { createApp, reactive } from 'vue'
import { createPinia } from 'pinia'
import { supabase } from '@/stores/supabase'

// Vuetify setup (kept the same)
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

// Define the reactive authState
export const authState = reactive({
  isAuthenticated: false,
  user: null
}) // Exporting authState for use in router/index.js

// Restore session and set authState
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session && session.user) {
    authState.isAuthenticated = true
    authState.user = {
      id: session.user.id,
      email: session.user.email,
      fullname: `${session.user.user_metadata?.first_name || ''} ${
        session.user.user_metadata?.last_name || ''
      }`.trim()
    }
  }
})

// Listen for auth state changes to update authState and handle redirects
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    authState.isAuthenticated = true
    authState.user = {
      id: session.user.id,
      email: session.user.email,
      fullname: `${session.user.user_metadata?.first_name || ''} ${
        session.user.user_metadata?.last_name || ''
      }`.trim()
    }
    router.push('/home') // Redirect to home immediately after sign-in
  } else if (event === 'SIGNED_OUT') {
    authState.isAuthenticated = false
    authState.user = null
  }
})

// Provide authState globally
app.provide('authState', authState)
app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
