import { createRouter, createWebHistory } from 'vue-router'
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
      beforeEnter: (to, from, next) => {
        // Extract token from the query params (as passed in the reset link)
        const token = to.query.access_token

        console.log('Retrieved token:', token) // Debugging line

        if (!token) {
          console.warn('Missing access token. Redirecting to login.')
          next('/login')
          return
        }

        // Proceed if the token is present
        next()
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
