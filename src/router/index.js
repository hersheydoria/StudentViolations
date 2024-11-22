import { createRouter, createWebHistory } from 'vue-router'
import { usePiniaStore } from '@/stores/piniaStore'
import { supabase } from '@/stores/supabase'
import { authState } from '@/main.js'
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
          piniaStore.setToken(token)
          localStorage.setItem('auth_token', token)

          try {
            const { error } = await supabase.auth.verifyOtp({
              type: 'recovery',
              token,
              redirectTo: `${window.location.origin}/reset-password`
            })

            if (error) {
              console.error('Token verification failed:', error.message)
              next('/login')
            } else {
              next() // Token valid, proceed
            }
          } catch (err) {
            console.error('Unexpected error:', err.message)
            next('/login')
          }
        } else {
          console.warn('Missing access token. Redirecting to login.')
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
    }
  ]
})

// Global guard for authenticated routes
router.beforeEach((to, from, next) => {
  if (to.name === 'ResetPassword') {
    next() // Skip global guards for password reset
    return
  }

  if (to.meta.requiresAuth && !authState.isAuthenticated) {
    next('/login') // Redirect to login if not authenticated
  } else {
    next() // Allow access
  }
})

export default router
