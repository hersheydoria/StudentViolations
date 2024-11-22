<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm.vue'

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Access token from the route's query parameters
const accessToken = ref(route.query.token || '')
onMounted(() => {
  console.log('Access Token in Parent:', accessToken.value)
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
              <!-- Pass accessToken as a prop to ResetPasswordForm -->
              <ResetPasswordForm :accessToken="accessToken" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </AppLayout>
  </v-app>
</template>
