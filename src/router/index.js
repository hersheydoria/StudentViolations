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
        let token = to.query.access_token || null
        if (!token && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.slice(1))
          token = hashParams.get('access_token')
        }

        if (!token) {
          console.warn('No token provided. Redirecting to login.')
          return next('/login')
        }

        try {
          // Retrieve the email from the query parameters or another source if applicable
          const email = to.query.email
          if (!email) {
            console.error('Email is missing in query parameters. Redirecting to login.')
            return next('/login')
          }

          // Verify the OTP token with the provided email
          const { data, error } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token,
            email // Include the email here
          })

          if (error) {
            console.error('Token verification failed:', error.message)
            return next('/login')
          }

          console.log('Token verified successfully.', data)

          // Store the recovery token in Pinia for later use
          piniaStore.setRecoveryToken(token)

          // Sign out to prevent automatic login
          await supabase.auth.signOut()

          next()
        } catch (err) {
          console.error('Unexpected error during token verification:', err.message)
          await supabase.auth.signOut()
          next('/login')
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
    { path: '/:pathMatch(.*)*', redirect: '/login' }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.name === 'ResetPassword') {
    next()
    return
  }

  if (to.meta.requiresAuth && !authState.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
