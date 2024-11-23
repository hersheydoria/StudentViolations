import { createRouter, createWebHistory } from 'vue-router'
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
      name: 'reset-password',
      component: ResetPasswordView,
      props: (route) => ({ accessToken: route.query.access_token }), // Pass accessToken as a prop
      meta: { requiresAuth: false } // No authentication required for reset password
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

// Function to extract access token from URL query
const getAccessToken = () => {
  const params = new URLSearchParams(window.location.search) // Use search for query params
  return params.get('access_token') // Retrieve the access_token
}

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authState.isAuthenticated) {
    return next('/login') // Redirect unauthenticated users to login
  }

  if (to.name === 'reset-password') {
    console.log('Accessing ResetPassword route')

    const accessToken = getAccessToken() // Get access token from URL query
    console.log('Access Token:', accessToken)

    if (!accessToken) {
      // If no access token is found, redirect to login
      return next({ name: 'login' })
    }

    // Allow access to ResetPassword even if authenticated (you can adjust this if needed)
    return next()
  }

  if (authState.isAuthenticated && (to.name === 'login' || to.name === 'reset-password')) {
    return next({ name: 'home' }) // Redirect authenticated users from login or reset-password to home
  }

  next() // Default behavior for other routes
})

export default router
