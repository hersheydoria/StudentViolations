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
  passwordMin: (v) => v.length >= 5 || 'Password must be at least 5 characters long',
  confirmPasswordMatch: (v) => v === newPassword.value || 'Passwords do not match'
}

// Lifecycle to verify token on mount
onMounted(async () => {
  token.value = route.query.access_token // Extract token from URL

  if (!token.value) {
    errorMessage.value = 'Invalid or missing token. Please request a new reset link.'
    redirectToLogin()
    return
  }

  try {
    // Verify the token validity
    const { error } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token: token.value
    })

    if (error) {
      console.error('Token verification error:', error.message)
      errorMessage.value = 'Invalid or expired token. Please request a new reset link.'
      token.value = null
      redirectToLogin()
    }
  } catch (err) {
    console.error('Unexpected error:', err.message)
    errorMessage.value = 'An error occurred. Please try again.'
    token.value = null
    redirectToLogin()
  }
})

// Redirect to login page after showing an error
function redirectToLogin() {
  setTimeout(() => {
    router.push('/login') // Use the path of your login route
  }, 3000) // Optional delay to display error message
}

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
    // Update the user's password
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
    }, 2000) // Delay for user feedback
  } catch (error) {
    errorMessage.value = 'An error occurred: ' + error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Reset Password</v-card-title>
          <v-card-text>
            <!-- Display error message if there's an error -->
            <v-alert v-if="errorMessage" type="error" class="mb-4">
              {{ errorMessage }}
            </v-alert>

            <!-- Display success message if password is updated successfully -->
            <v-alert v-if="successMessage" type="success" class="mb-4">
              {{ successMessage }}
            </v-alert>

            <!-- Password reset form -->
            <v-form v-model="valid" lazy-validation>
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
                :rules="[rules.required, rules.confirmPasswordMatch]"
                label="Confirm Password"
                prepend-icon="mdi-lock"
                type="password"
                required
                :disabled="!token || loading"
              ></v-text-field>

              <!-- Submit button -->
              <v-btn
                :loading="loading"
                color="customGreen"
                @click="updatePassword"
                block
                :disabled="!token || loading"
              >
                Update Password
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
