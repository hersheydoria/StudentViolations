import { createRouter, createWebHistory } from 'vue-router'
// Import the shared authState
import { authState } from '@/main.js'

// Importing the views
import LoginView from '@/views/auth/LoginView.vue'
import VisitorView from '@/views/system/VisitorView.vue'
import HomeView from '@/views/system/HomeView.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
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
      meta: { requiresAuth: false }, // Exclude this route from auth checks
      beforeEnter: (to, from, next) => {
        console.log('Route object:', to) // Log the route object for debugging
        console.log('Access token:', to.query.access_token) // Check if the token is extracted

        if (!to.query.access_token) {
          console.warn('Missing access token. Redirecting to login.')
          next('/login') // Redirect if no token is provided
        } else {
          next() // Allow access
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
  // Skip auth check for routes without auth requirement
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // General session-based auth check
  if (!authState.isAuthenticated) {
    console.warn('User is not authenticated. Redirecting to login.')
    next('/login') // Redirect to login if not authenticated
  } else {
    next() // Allow access
  }
})

export default router
