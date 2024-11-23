<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router' // Import useRouter for navigation
import { supabase } from '@/stores/supabase' // Import your supabase instance

const newPassword = ref('')
const confirmPassword = ref('')
const valid = ref(true)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const router = useRouter() // Initialize the router

// Validation rules
const rules = {
  required: (value) => !!value || 'Required.',
  passwordMin: (v) => v.length >= 5 || 'Password must be at least 5 characters long'
}

// Custom validation rule for matching passwords
const confirmPasswordMatch = (v) => v === newPassword.value || 'Passwords do not match'

// Method to update the password
async function updatePassword() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

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

    successMessage.value = 'Password updated successfully!'
    newPassword.value = ''
    confirmPassword.value = ''

    // Redirect to the login page after successful password update
    setTimeout(() => {
      router.push('/login') // Use the path of your login route
    }, 1000) // Optional: Delay for 1 second before redirecting
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
