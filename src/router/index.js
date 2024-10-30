import { createRouter, createWebHistory } from 'vue-router'

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
      redirect: '/login' // Default route redirects to login
    },
    {
      path: '/login', // Login route
      name: 'login',
      component: LoginView
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: ResetPasswordView
    },
    {
      path: '/visitor', // Visitor view route
      name: 'visitor',
      component: VisitorView
    },
    {
      path: '/home', // Home view (Dashboard) route after login
      name: 'home',
      component: HomeView
    }
  ]
})

export default router
