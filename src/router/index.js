import { createRouter, createWebHistory } from 'vue-router'
import { usePiniaStore } from '@/stores/piniaStore' // Import the store
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
      beforeEnter: (to, from, next) => {
        const piniaStore = usePiniaStore()
        let token = to.query.access_token

        if (!token && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.slice(1))
          token = hashParams.get('access_token')
        }

        if (token) {
          piniaStore.setToken(token)
          const tokenExpiry = JSON.parse(atob(token.split('.')[1])).exp * 1000

          if (Date.now() > tokenExpiry) {
            console.warn('Token expired. Redirecting to login.')
            router.push('/login') // Redirect if token expired
          } else {
            next() // Proceed if the token is valid
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
  const token = localStorage.getItem('accessToken')
  console.log('Global auth check - token:', token) // Debugging the token here

  // Skip auth check for routes without auth requirement
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // General session-based auth check
  if (!token) {
    console.warn('User is not authenticated. Redirecting to login.')
    next('/login') // Redirect to login if not authenticated
  } else {
    next() // Allow access
  }
})

export default router
