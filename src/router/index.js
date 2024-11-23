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
      name: 'ResetPassword',
      component: ResetPasswordView,
      props: (route) => ({ accessToken: route.query.access_token }) // Pass accessToken as a prop
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

// Function to extract access token from URL hash
const getAccessToken = () => {
  const hash = window.location.hash.substr(1) // Remove the leading '#'
  const params = new URLSearchParams(hash)
  return params.get('access_token') // Retrieve the access_token
}

router.beforeEach((to, from, next) => {
  // Handle routes that require authentication (requiresAuth = true)
  if (to.meta.requiresAuth && !authState.isAuthenticated) {
    return next('/login') // Redirect unauthenticated users to login
  }

  // Handle ResetPassword route access
  if (to.name === 'ResetPassword') {
    console.log('Accessing ResetPassword route')

    const accessToken = getAccessToken() // Extract access token from URL hash
    console.log('Access Token:', accessToken)

    // If no access token is found, redirect to login
    if (!accessToken) {
      return next({ name: 'login' })
    }

    // If there's an access token, allow access to ResetPassword even if not authenticated
    return next()
  }

  // If the user is authenticated and trying to access login or reset password, redirect to home
  if (authState.isAuthenticated && (to.name === 'login' || to.name === 'ResetPassword')) {
    return next({ name: 'home' }) // Redirect authenticated users from login or reset password to home
  }

  // Default behavior for other routes
  next()
})

export default router
