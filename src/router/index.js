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
  console.log('Navigating to:', to.name)
  console.log('Query parameters:', to.query)

  if (to.name === 'ResetPassword') {
    console.log('Accessing ResetPassword route')
    console.log('Access Token:', to.query.access_token)
    if (authState.isAuthenticated) {
      console.log('User is authenticated, redirecting to home')
      return next({ name: 'home' })
    }

    if (!to.query.access_token) {
      console.log('No access token found, redirecting to login')
      return next({ name: 'login' })
    }

    console.log('Access token exists, allowing navigation')
    return next()
  }

  next()
})

export default router
