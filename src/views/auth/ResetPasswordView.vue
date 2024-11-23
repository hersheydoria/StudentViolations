<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm.vue'

// Function to extract access token from URL hash
const getAccessToken = () => {
  const hash = window.location.hash.substr(1) // Remove the leading '#'
  const params = new URLSearchParams(hash)
  return params.get('access_token') // Retrieve the access_token
}

const accessToken = ref(null)

onMounted(() => {
  // Use the custom getAccessToken function to retrieve the token
  accessToken.value = getAccessToken()
  console.log('Access Token in ResetPasswordView:', accessToken.value)

  if (!accessToken.value) {
    // Handle case where access token is not available
    console.error('No access token found in URL hash.')
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
