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

        // If email is not in the URL, check if it is in the redirect_to URL (from Supabase's link)
        if (!email && to.query.redirect_to) {
          const redirectUrl = new URL(to.query.redirect_to)
          email = redirectUrl.searchParams.get('email')
        }

        if (!token || !email) {
          console.warn('Token or email is missing. Redirecting to login.')
          return next('/login')
        }

        try {
          // Verify the OTP token with the provided email
          const { data, error } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token,
            email // Pass email to the verifyOtp function
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
