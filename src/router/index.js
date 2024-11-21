import { createRouter, createWebHistory } from 'vue-router'
import { usePiniaStore } from '@/stores/piniaStore' // Import the store
import { supabase } from '@/stores/supabase'
import LoginView from '@/views/auth/LoginView.vue'
import VisitorView from '@/views/system/VisitorView.vue'
import HomeView from '@/views/system/HomeView.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: ResetPasswordView,
      meta: { requiresAuth: false },
      beforeEnter: async (to, from, next) => {
        const piniaStore = usePiniaStore()
        let token = to.query.access_token || localStorage.getItem('auth_token')

        // If no token in URL or localStorage, try retrieving from hash
        if (!token && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.slice(1))
          token = hashParams.get('access_token')
        }

        if (token) {
          piniaStore.setToken(token) // Store token in Pinia store
          localStorage.setItem('auth_token', token) // Persist token in localStorage

          // Check if token is expired
          const tokenExpiry = JSON.parse(atob(token.split('.')[1])).exp * 1000
          if (Date.now() > tokenExpiry) {
            console.warn('Token expired. Attempting to refresh...')

            // Token expired, attempt to refresh
            supabase.auth
              .refreshSession() // Use Supabase to refresh session
              .then((newSession) => {
                piniaStore.setToken(newSession.access_token) // Update token
                console.log('Token refreshed successfully')
                next() // Continue if refreshed
              })
              .catch((error) => {
                console.error('Token refresh failed', error)
                router.push('/login') // Redirect to login if refresh fails
              })
          } else {
            next() // Token is still valid, continue navigation
          }
        } else {
          console.warn('Missing access token. Redirecting to login.')
          router.push('/login') // Redirect to login if no token
        }
      }
    },
    {
      path: '/visitor',
      name: 'visitor',
      component: VisitorView
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    }
  ]
})

// Global guard for authenticated routes
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authState.isAuthenticated) {
    next('/login') // Redirect to login if not authenticated
  } else {
    next() // Allow access
  }
})

export default router
