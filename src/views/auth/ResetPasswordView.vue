<script setup>
import { useRouter, useRoute } from 'vue-router'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm.vue'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const router = useRouter()

// Handle the case where access token is missing
if (!route.query.access_token) {
  console.error('Access token missing. Redirecting to login.')
  router.push({ name: 'login' })
} else {
  console.log('Access token found:', route.query.access_token)
  // Continue with the reset password logic if token is present
}
</script>

<template>
  <v-app>
    <!-- Use AppLayout as a wrapper and pass the login form via the default slot -->
    <AppLayout>
      <v-row class="d-flex justify-center align-center">
        <v-col cols="12" md="6">
          <v-card class="px-6 py-6" elevation="12" rounded="xl" style="background-color: #e6ffb1">
            <!-- Add image above the heading -->
            <v-img
              src="/logo6.png"
              alt="System Logo"
              contain
              max-width="120"
              class="mx-auto mb-4"
            ></v-img>

            <!-- Card title for "Login" -->
            <v-card-title class="text-center">
              <h3 class="font-weight-bold" style="color: #286643">Reset Password</h3>
            </v-card-title>

            <!-- Card content -->
            <v-card-text>
              <ResetPasswordForm></ResetPasswordForm>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </AppLayout>
  </v-app>
</template>
