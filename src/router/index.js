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
        let email = to.query.email || null

        console.log('Initial Query Params:', to.query)

        // Check the hash fragment if token or email is missing
        if (!token || !email) {
          try {
            const hashParams = new URLSearchParams(window.location.hash.slice(1))
            token = token || hashParams.get('access_token')
            email = email || hashParams.get('email')

            console.log('Extracted from Hash Fragment:', {
              token,
              email
            })
          } catch (error) {
            console.error('Error parsing URL hash fragment:', error.message)
          }
        }

        if (!token || !email) {
          console.warn('Token or email is missing. Redirecting to login.')
          return next('/login')
        }

        try {
          const { data, error } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token,
            email
          })

          if (error) {
            console.error('Token verification failed:', error.message)
            return next('/login')
          }

          console.log('Token verified successfully:', data)
          piniaStore.setRecoveryToken(token)

          await supabase.auth.signOut()

          next()
        } catch (err) {
          console.error('Unexpected error during token verification:', err.message)
          return next('/login')
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
