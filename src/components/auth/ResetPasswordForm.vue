<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/stores/supabase'

// Inject the global auth state
const authState = inject('authState')

// Define Props
defineProps({
  accessToken: {
    type: String,
    required: true // Ensure this prop is passed and is required
  }
})

// Form state
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const router = useRouter()

// Validation rules
const rules = {
  required: (value) => !!value || 'Field is required',
  passwordMin: (value) => value?.length >= 8 || 'Password must be at least 8 characters long'
}

const confirmPasswordMatch = (value) => value === newPassword.value || 'Passwords do not match.'

onMounted(async () => {
  // Use the accessToken prop directly
  if (!accessToken) {
    errorMessage.value = 'Invalid or missing access token. Please use the link sent to your email.'
    setTimeout(() => router.push('/login'), 3000) // Redirect after 3 seconds
    return
  }

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
      password: newPassword.value,
      access_token: accessToken // Use the accessToken prop directly
    })

    if (error) {
      throw error
    }

    successMessage.value = 'Password updated successfully! Redirecting to login...'
    newPassword.value = ''
    confirmPassword.value = ''

    authState.isPasswordResetting = false

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
  <v-form @keyup.enter="updatePassword">
    <!-- New Password -->
    <v-text-field
      v-model="newPassword"
      :rules="[rules.required, rules.passwordMin]"
      label="New Password"
      prepend-icon="mdi-lock"
      type="password"
      required
    ></v-text-field>

    <!-- Confirm Password -->
    <v-text-field
      v-model="confirmPassword"
      :rules="[rules.required, confirmPasswordMatch]"
      label="Confirm Password"
      prepend-icon="mdi-lock"
      type="password"
      required
    ></v-text-field>

    <!-- Error Alert -->
    <v-alert v-if="errorMessage" type="error" class="mt-4">
      {{ errorMessage }}
    </v-alert>

    <!-- Success Alert -->
    <v-alert v-if="successMessage" type="success" class="mt-4">
      {{ successMessage }}
    </v-alert>

    <!-- Submit Button -->
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
