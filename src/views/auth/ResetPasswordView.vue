<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm.vue'

const route = useRoute()

// Ensure access token is retrieved correctly
const accessToken = ref(route.query.token || '')

onMounted(() => {
  if (!accessToken.value) {
    // Handle case where there is no token
    console.error('No access token found in the query parameters')
    // Optionally redirect to login if no token
  }
})
</script>
<template>
  <v-app>
    <AppLayout>
      <v-row class="d-flex justify-center align-center">
        <v-col cols="12" md="6">
          <v-card class="px-6 py-6" elevation="12" rounded="xl" style="background-color: #e6ffb1">
            <v-img
              src="/logo6.png"
              alt="System Logo"
              contain
              max-width="120"
              class="mx-auto mb-4"
            ></v-img>
            <v-card-title class="text-center">
              <h3 class="font-weight-bold" style="color: #286643">Reset Password</h3>
            </v-card-title>
            <v-card-text>
              <ResetPasswordForm :accessToken="accessToken" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </AppLayout>
  </v-app>
</template>
