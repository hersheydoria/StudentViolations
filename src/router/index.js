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

router.beforeEach((to, from, next) => {
  // Authentication check for routes requiring auth
  if (to.meta.requiresAuth && !authState.isAuthenticated) {
    return next('/login') // Redirect unauthenticated users to login
  }

  // ResetPassword route access control
  if (to.name === 'ResetPassword') {
    if (authState.isAuthenticated) {
      // If the user is logged in, redirect them to the home page
      return next({ name: 'home' })
    }

    if (!to.query.access_token) {
      // If no access token is present in the query, redirect to login
      return next({ name: 'login' })
    }

    // Allow access if the access token exists
    return next()
  }

  // Default navigation behavior
  next()
})

export default router
