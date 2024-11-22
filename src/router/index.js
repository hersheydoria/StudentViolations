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

        // Get the redirect_to parameter
        const redirectUrl = to.query.redirect_to || null

        if (!redirectUrl) {
          console.warn('No redirect_to URL found. Redirecting to login.')
          return next('/login')
        }

        try {
          // Parse the redirect_to URL
          const redirect = new URL(redirectUrl)

          // Extract token and email from the redirect URL
          const token = redirect.searchParams.get('access_token')
          const email = redirect.searchParams.get('email')

          console.log('Redirect URL:', redirect.toString()) // Debugging: log the entire redirect URL
          console.log('Extracted Token:', token) // Debugging: log the token
          console.log('Extracted Email:', email) // Debugging: log the email

          if (!token || !email) {
            console.warn('Token or email is missing in the redirect URL. Redirecting to login.')
            return next('/login')
          }

          // Verify the OTP token with the extracted email
          const { data, error } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token,
            email
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
          console.error('Error parsing redirect_to URL:', err.message)
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
