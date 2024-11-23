import { createRouter, createWebHistory } from 'vue-router'
import { authState } from '@/main.js'

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
      meta: { requiresAuth: false }
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

router.beforeEach((to, from, next) => {
  const isAuthenticated = authState.isAuthenticated
  const requiresAuth = to.meta.requiresAuth
  const isPasswordRecovery = authState.isPasswordRecovery

  console.log('Route Guard:', { from, to })

  // Case 1: If the route requires auth and the user is not authenticated, redirect to login
  if (requiresAuth && !isAuthenticated) {
    console.log('Unauthenticated user trying to access protected route. Redirecting to login.')
    next({ name: 'login' })
  }
  // Case 2: If the route is ResetPassword and the user is NOT authenticated, proceed to login
  else if (to.name === 'ResetPassword' && !isAuthenticated && !isPasswordRecovery) {
    console.log('Unauthenticated user trying to access ResetPassword. Redirecting to login.')
    next({ name: 'login' })
  }
  // Case 3: If the route is ResetPassword and the user is authenticated, allow access
  else if (to.name === 'ResetPassword' && isAuthenticated) {
    console.log('Authenticated user trying to access ResetPassword. Proceeding.')
    next() // Allow access to ResetPassword
  }
  // Case 4: If the user is in the password recovery process, stay on ResetPassword page
  else if (isPasswordRecovery && to.name !== 'ResetPassword') {
    console.log('Password recovery process, staying on ResetPassword page.')
    next({ name: 'ResetPassword' })
  }
  // Case 5: If the user is authenticated, proceed to the requested route
  else if (isAuthenticated) {
    console.log('Authenticated user, proceeding to route:', to.name)
    next() // Proceed to the requested route
  }
  // Case 6: If none of the above, proceed normally
  else {
    console.log('Proceeding to route:', to.name)
    next() // Allow access to any other route
  }
})

export default router
