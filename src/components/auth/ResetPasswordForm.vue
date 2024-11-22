<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/stores/supabase'

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const accessToken = ref('')

const router = useRouter()

// Function to extract access token from URL hash
const getAccessToken = () => {
  const hash = window.location.hash.substr(1) // Remove the leading '#'
  const params = new URLSearchParams(hash)
  return params.get('access_token') // Retrieve the access_token
}

// Sign out any currently logged-in user
onMounted(async () => {
  const token = getAccessToken() // Get the access token from the URL
  accessToken.value = token
  if (accessToken.value) {
    // Optionally, you can use the access token here to verify if it's valid
    // You could call a Supabase or custom API endpoint to validate the token
  }

  const { user } = await supabase.auth.getUser()
  if (user) {
    await supabase.auth.signOut() // Ensure the user is logged out if logged in
  }
})

async function updatePassword() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

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

    // Automatically redirect after 2 seconds
    setTimeout(() => router.push('/login'), 2000)
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
