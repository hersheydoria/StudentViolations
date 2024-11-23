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
  if (to.meta.requiresAuth && !authState.isAuthenticated) {
    return next('/login') // Redirect unauthenticated users to login
  }

  if (to.name === 'ResetPassword') {
    console.log('Accessing ResetPassword route')

    const accessToken = getAccessToken() // Use the helper function
    console.log('Access Token:', accessToken)

    if (authState.isAuthenticated) {
      return next({ name: 'home' }) // Redirect logged-in users to home
    }

    if (!accessToken) {
      return next({ name: 'login' }) // Redirect to login if no token is present
    }

    return next() // Allow access if the token exists
  }

  next() // Default behavior for other routes
})

export default router
