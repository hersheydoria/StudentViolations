<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm.vue' // Import the form component

const route = useRoute()
const accessToken = ref('')

onMounted(() => {
  // Check if the access token is present in the query parameters
  if (!route.query.access_token) {
    accessToken.value = null // Invalid token
  } else {
    // Get the access token from the URL query parameters
    accessToken.value = route.query.access_token
  }
})
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
