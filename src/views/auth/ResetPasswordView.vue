<script setup>
import ResetPasswordForm from '@/components/auth/ResetPasswordForm.vue'
import { ref } from 'vue'

// Reactive state for the dialog
const isDialogOpen = ref(true) // Controls whether the dialog is open or closed

// Handle successful password reset
function handleResetSuccess() {
  isDialogOpen.value = false // Close dialog on successful reset
}
</script>

<template>
  <v-dialog
    v-model="isDialogOpen"
    max-width="500"
    elevation="10"
    style="backdrop-filter: blur(8px)"
  >
    <v-card class="px-6 py-6" elevation="12" rounded="xl" style="background-color: #e6ffb1">
      <v-card-title class="headline">
        <strong>Reset Password</strong>
      </v-card-title>
      <ResetPasswordForm @reset-success="handleResetSuccess"></ResetPasswordForm>
      <v-card-actions>
        <v-btn text @click="isDialogOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
