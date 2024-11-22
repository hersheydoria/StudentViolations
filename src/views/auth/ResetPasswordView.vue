<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm.vue'

defineProps({
  accessToken: {
    type: String,
    required: true // Ensure accessToken is provided by the router
  }
})
</script>

<template>
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
</template>
