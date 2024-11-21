<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/stores/supabase'

// State variables
const newPassword = ref('')
const confirmPassword = ref('')
const valid = ref(true)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const token = ref(null)

const route = useRoute()
const router = useRouter()

function parseHash(hash) {
  const hashParams = {}
  const regex = /([^&=]+)=([^&]*)/g
  let match
  while ((match = regex.exec(hash))) {
    hashParams[decodeURIComponent(match[1])] = decodeURIComponent(match[2])
  }
  return hashParams
}

onMounted(async () => {
  // Check if access_token exists in query or hash
  let tokenFromUrl = route.query.access_token

  if (!tokenFromUrl && window.location.hash) {
    const hashParams = parseHash(window.location.hash.substring(1)) // Remove leading "#"
    tokenFromUrl = hashParams.access_token
  }

  console.log('Access Token:', tokenFromUrl) // Debugging line

  if (!tokenFromUrl) {
    errorMessage.value = 'Invalid or missing token. Please request a new reset link.'
    redirectToLogin()
    return
  }

  token.value = tokenFromUrl

  try {
    const { error } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token: token.value
    })

    if (error) {
      errorMessage.value = 'Invalid or expired token. Please request a new reset link.'
      redirectToLogin()
    }
  } catch (err) {
    console.error('Unexpected error:', err.message)
    errorMessage.value = 'An unexpected error occurred. Please try again.'
    redirectToLogin()
  }
})

function redirectToLogin() {
  setTimeout(() => {
    router.push('/login')
  }, 2000)
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
