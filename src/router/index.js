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

router.beforeEach(async (to, from, next) => {
  const isLoggedIn = await authState.isAuthenticated()

  if (to.meta.requiresAuth && !authState.isAuthenticated) {
    next('/login') // Redirect unauthenticated users to login
  } else {
    next() // Proceed with the route
  }

  if (to.name === 'ResetPassword') {
    // If the user is logged in, redirect to the home page
    if (isLoggedIn) {
      return { name: 'home' } // Redirect logged-in users to home
    }

    if (!to.query.access_token) {
      return { name: 'login' } // Redirect to login if no token is present
    }

    return true // Allow access if the token exists and the user is not logged in
  }
})

export default router
