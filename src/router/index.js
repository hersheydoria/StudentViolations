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

        let token = to.query.token || null // Extract token from query params
        let email = to.query.email || null // Extract email from query params

        console.log('Initial Query Params:', to.query)
        console.log('Extracted Token:', token)
        console.log('Extracted Email:', email)

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
