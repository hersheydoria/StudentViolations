<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const route = useRoute()
const router = useRouter()

// Form data
const newPassword = ref('')
const confirmPassword = ref('')
const valid = ref(true)
const resetToken = ref('')

const passwordRules = {
  required: (value) => !!value || 'Required.',
  passwordMin: (v) => v.length >= 6 || 'Password must be at least 6 characters long',
  passwordMatch: (v) => v === newPassword.value || 'Passwords must match'
}

// Alerts for success/error messages
const errorMessage = ref('')
const passwordResetSuccess = ref(false)

// Get the reset token from the URL when the page is loaded
onMounted(() => {
  resetToken.value = route.query.access_token
  if (!resetToken.value) {
    // If there's no token, redirect back to login
    router.push('/login')
  }
})

// Reset password logic
async function onSetNewPassword() {
  if (valid.value && resetToken.value) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword.value,
        access_token: resetToken.value // Include the reset token here
      })

      if (error) {
        errorMessage.value = 'Error resetting password. Please try again.'
        console.error('Error resetting password:', error)
      } else {
        passwordResetSuccess.value = true
        setTimeout(() => router.push('/login'), 3000) // Redirect after showing success message for a few seconds
      }
    } catch (err) {
      errorMessage.value = 'An unexpected error occurred. Please try again.'
      console.error('Unexpected error:', err)
    }
  }
}
</script>

<template>
  <!-- Card Title -->
  <v-card-title class="headline text-center">
    <strong>Reset Password</strong>
  </v-card-title>

  <!-- Card Content -->
  <v-card-text>
    <v-form v-model="valid" lazy-validation>
      <!-- New Password -->
      <v-text-field
        v-model="newPassword"
        :rules="[passwordRules.required, passwordRules.passwordMin]"
        label="New Password"
        prepend-icon="mdi-lock"
        type="password"
        required
      ></v-text-field>

      <!-- Confirm Password -->
      <v-text-field
        v-model="confirmPassword"
        :rules="[passwordRules.required, passwordRules.passwordMatch]"
        label="Confirm Password"
        prepend-icon="mdi-lock"
        type="password"
        required
      ></v-text-field>
    </v-form>

    <!-- Success and Error Alerts -->
    <v-alert v-if="passwordResetSuccess" type="success" class="mt-4">
      Password has been successfully reset. Redirecting to login...
    </v-alert>
    <v-alert v-if="errorMessage" type="error" class="mt-4">
      {{ errorMessage }}
    </v-alert>
  </v-card-text>

  <!-- Card Actions -->
  <v-card-actions class="d-flex justify-center">
    <v-btn text @click="router.push('/login')">Cancel</v-btn>
    <v-btn color="customGreen" @click="onSetNewPassword">Set New Password</v-btn>
  </v-card-actions>
</template>
