<script setup>
import ResetPasswordForm from '@/components/auth/ResetPasswordForm.vue'
import { ref } from 'vue'

// Reactive state for the dialog
const isDialogOpen = ref(true) // Controls whether the dialog is open or closed
</script>

<template>
  <v-dialog
    v-model="isDialogOpen"
    max-width="500"
    elevation="10"
    style="backdrop-filter: blur(8px)"
  >
    <v-card class="px-6 py-6" elevation="12" rounded="xl" style="background-color: #e6ffb1">
      <ResetPasswordForm></ResetPasswordForm>
    </v-card>
  </v-dialog>
</template>
