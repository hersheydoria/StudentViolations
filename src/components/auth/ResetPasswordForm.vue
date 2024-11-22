<script setup>
import { ref } from 'vue'
import { supabase } from '@/stores/supabase'
import { useRouter } from 'vue-router'

const props = defineProps({
  accessToken: {
    type: String,
    required: true // Ensure accessToken is required here
  }
})

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const router = useRouter()

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
      access_token: props.accessToken // Ensure you're using props.accessToken here
    })

    if (error) {
      throw error
    }

    successMessage.value = 'Password updated successfully! Redirecting to login...'
    newPassword.value = ''
    confirmPassword.value = ''

    setTimeout(() => router.push('/login'), 2000)
  } catch (error) {
    errorMessage.value = 'An error occurred: ' + error.message
    console.error('Password reset error:', error)
  } finally {
    loading.value = false
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
