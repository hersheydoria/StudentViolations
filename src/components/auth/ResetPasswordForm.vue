<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router' // Import useRouter and useRoute for navigation and token extraction
import { supabase } from '@/stores/supabase' // Import your supabase instance

// Form state and validation
const newPassword = ref('')
const confirmPassword = ref('')
const valid = ref(true)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Token and router instance
const route = useRoute()
const router = useRouter()
const token = ref(null) // Token from query parameter

// Validation rules
const rules = {
  required: (value) => !!value || 'Required.',
  passwordMin: (v) => v.length >= 5 || 'Password must be at least 5 characters long'
}

// Custom validation rule for matching passwords
const confirmPasswordMatch = (v) => v === newPassword.value || 'Passwords do not match'

// Lifecycle to verify token on mount
onMounted(async () => {
  token.value = route.query.access_token // Extract token from URL
  if (!token.value) {
    errorMessage.value = 'Invalid or missing token.'
    return
  }

  try {
    const { error } = await supabase.auth.verifyOTP({
      type: 'recovery',
      token: token.value
    })

    if (error) {
      errorMessage.value = 'Invalid or expired token. Please request a new reset link.'
      token.value = null // Mark token as invalid
    }
  } catch (err) {
    console.error('Error verifying token:', err.message)
    errorMessage.value = 'An unexpected error occurred. Please try again.'
    token.value = null
  }
})

// Method to update the password
async function updatePassword() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  // Check if token is valid
  if (!token.value) {
    errorMessage.value = 'Invalid or missing token. Please request a new reset link.'
    loading.value = false
    return
  }

  // Check if passwords match
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    loading.value = false
    return
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value
    })

    if (error) {
      throw error
    }

    successMessage.value = 'Password updated successfully! Redirecting to login...'
    newPassword.value = ''
    confirmPassword.value = ''

    // Redirect to login page after a short delay
    setTimeout(() => {
      router.push('/login') // Use the path of your login route
    }, 1000) // Delay for user feedback
  } catch (error) {
    errorMessage.value = 'Error: ' + error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-form v-model="valid" lazy-validation @keyup.enter="updatePassword">
    <!-- Trigger on Enter key -->
    <!-- New Password field -->
    <v-text-field
      v-model="newPassword"
      :rules="[rules.required, rules.passwordMin]"
      label="New Password"
      prepend-icon="mdi-lock"
      type="password"
      required
      :disabled="!token || loading"
    ></v-text-field>

    <!-- Confirm Password field -->
    <v-text-field
      v-model="confirmPassword"
      :rules="[rules.required, confirmPasswordMatch]"
      label="Confirm Password"
      prepend-icon="mdi-lock"
      type="password"
      required
      :disabled="!token || loading"
    ></v-text-field>

    <!-- Display error message if there's an error -->
    <v-alert v-if="errorMessage" type="error" class="mt-4">
      {{ errorMessage }}
    </v-alert>

    <!-- Display success message if password is updated successfully -->
    <v-alert v-if="successMessage" type="success" class="mt-4">
      {{ successMessage }}
    </v-alert>

    <!-- Submit button -->
    <v-row>
      <v-col class="text-right">
        <v-btn
          :loading="loading"
          color="customGreen"
          @click="updatePassword"
          style="width: 100%; height: 40px; font-size: 18px"
          :disabled="!token || loading"
        >
          Update Password
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>
