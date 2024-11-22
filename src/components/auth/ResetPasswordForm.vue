<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/stores/supabase'

const authState = inject('authState')

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const accessToken = ref('')

const router = useRouter()

// Extract the access token from the URL hash
const getAccessToken = () => {
  const hash = window.location.hash.substr(1) // Remove the leading '#'
  const params = new URLSearchParams(hash)
  return params.get('access_token') // Retrieve the access_token
}

onMounted(async () => {
  const token = getAccessToken() // Get the access token from the URL
  accessToken.value = token

  if (!accessToken.value) {
    errorMessage.value = 'Invalid or missing access token. Please use the link sent to your email.'
    setTimeout(() => router.push('/login'), 3000) // Redirect to login after 3 seconds
    return
  }

  // Indicate that a password reset process is ongoing
  authState.isPasswordResetting = true

  // Log out any currently logged-in user
  const { user } = await supabase.auth.getUser()
  if (user) {
    await supabase.auth.signOut()
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

    // Clear the password resetting flag
    authState.isPasswordResetting = false

    // Automatically redirect after 2 seconds
    setTimeout(() => router.push('/login'), 2000)
  } catch (error) {
    errorMessage.value = 'An error occurred: ' + error.message
    console.error('Password reset error:', error)
  } finally {
    loading.value = false
    authState.isPasswordResetting = false
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
    ></v-text-field>

    <!-- Confirm Password field -->
    <v-text-field
      v-model="confirmPassword"
      :rules="[rules.required, confirmPasswordMatch]"
      label="Confirm Password"
      prepend-icon="mdi-lock"
      type="password"
      required
    ></v-text-field>

    <!-- Display error message if there's an error -->
    <v-alert v-if="errorMessage" type="error" class="mt-4">
      {{ errorMessage }}
    </v-alert>

    <!-- Display success message if password is updated successfully -->
    <v-alert v-if="successMessage" type="success" class="mt-4">
      {{ successMessage }}
    </v-alert>

    <v-row>
      <v-col class="text-right">
        <v-btn
          :loading="loading"
          color="customGreen"
          @click="updatePassword"
          style="width: 100%; height: 40px; font-size: 18px"
        >
          Update Password
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>
