import { createRouter, createWebHistory } from 'vue-router'
import { usePiniaStore } from '@/stores/piniaStore'
import { supabase } from '@/stores/supabase'
import { authState } from '@/main.js' // Global authentication state
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

        // Retrieve the recovery token from the URL (query string or hash)
        let token = to.query.access_token || null
        if (!token && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.slice(1))
          token = hashParams.get('access_token')
        }

        if (!token) {
          console.warn('No token provided. Redirecting to login.')
          return next('/login') // Redirect if token is missing
        }

        try {
          // Verify the OTP token for password recovery
          const { data, error } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token
          })

          if (error) {
            console.error('Token verification failed:', error.message)
            return next('/login') // Redirect to login on failure
          }

          console.log('Token verified successfully.', data)

          // Store the recovery token in Pinia for later use
          piniaStore.setRecoveryToken(token)

          // Proceed to the reset-password page
          next()
        } catch (err) {
          console.error('Unexpected error during token verification:', err.message)

          // Ensure no unintended session creation
          await supabase.auth.signOut()
          next('/login') // Redirect on unexpected errors
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
    },
    // Fallback for undefined routes
    { path: '/:pathMatch(.*)*', redirect: '/login' }
  ]
})

// Global guard for authenticated routes
router.beforeEach((to, from, next) => {
  // Skip global guards for the ResetPassword route
  if (to.name === 'ResetPassword') {
    next()
    return
  }

  // Check for authentication on protected routes
  if (to.meta.requiresAuth && !authState.isAuthenticated) {
    next('/login') // Redirect to login if not authenticated
  } else {
    next() // Allow access
  }
})

export default router
