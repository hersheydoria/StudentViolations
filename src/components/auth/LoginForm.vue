<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/stores/supabase'

// Form data and states
const email = ref('')
const password = ref('')
const valid = ref(true)
const loading = ref(false)
const errorMessage = ref('')

// Forgot Password modal
const forgotPasswordDialog = ref(false)
const emailForReset = ref('') // Email for password reset
const emailSent = ref(false)

// Router instance
const router = useRouter()

// Validation rules
const rules = {
  required: (value) => !!value || 'Required.',
  passwordMin: (v) => v.length >= 5 || 'Password must be at least 5 characters long',
  email: (value) => /.+@.+\..+/.test(value) || 'E-mail must be valid.'
}

// Mounted lifecycle to check session status
onMounted(async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (session && session.user) {
    router.push('/home')
  }

  // Add keydown event listener for Enter key
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault() // Prevent default behavior on Enter key
      if (forgotPasswordDialog.value) {
        // If the forgot password dialog is open, handle reset password
        onResetPassword()
      } else {
        // Otherwise, attempt to log in
        onLogin()
      }
    }
  }

  document.addEventListener('keydown', handleKeyDown)

  // Clean up event listener on component unmount
  return () => {
    document.removeEventListener('keydown', handleKeyDown)
  }
})

// Import authState from injected context
import { inject } from 'vue'

const authState = inject('authState') // Access the globally provided authState

async function onLogin() {
  errorMessage.value = ''
  loading.value = true

  // Check for missing email or password
  if (!email.value && !password.value) {
    errorMessage.value = 'Please enter both email and password'
    loading.value = false
    return
  } else if (!email.value) {
    errorMessage.value = 'Please enter your email'
    loading.value = false
    return
  } else if (!password.value) {
    errorMessage.value = 'Please enter your password'
    loading.value = false
    return
  }

  // Proceed with login if the form is valid
  if (valid.value) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })

      if (error) {
        errorMessage.value = 'Invalid login credentials'
        console.error('Login error:', error.message)
      } else if (data?.user) {
        // Set authState immediately after successful login
        authState.isAuthenticated = true
        authState.user = {
          id: data.user.id,
          email: data.user.email,
          fullname: `${data.user.user_metadata?.first_name || ''} ${
            data.user.user_metadata?.last_name || ''
          }`.trim()
        }

        // Redirect to home immediately after login
        router.push('/home')
      }
    } catch (error) {
      errorMessage.value = 'An unexpected error occurred'
      console.error('Unexpected error:', error)
    }
  }

  loading.value = false
}

// Open Forgot Password modal
function onForgotPassword() {
  forgotPasswordDialog.value = true
}

// Reset password function
async function onResetPassword() {
  errorMessage.value = '' // Clear any previous error messages

  if (valid.value) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailForReset.value, {
        redirectTo: 'http://student-violations.vercel.app/reset-password' // Adjust this URL based on your environment
      })

      if (error) {
        throw error
      }

      emailSent.value = true
      forgotPasswordDialog.value = false
    } catch (error) {
      errorMessage.value = error.message
      console.error('Password reset error:', error)
    }
  }
}
</script>

<template>
  <v-form v-model="valid" lazy-validation>
    <!-- Email field -->
    <v-text-field
      v-model="email"
      :rules="[rules.required, rules.email]"
      label="Email"
      prepend-icon="mdi-email"
      required
    ></v-text-field>

    <!-- Password field -->
    <v-text-field
      v-model="password"
      :rules="[rules.required, rules.passwordMin]"
      label="Password"
      prepend-icon="mdi-lock"
      type="password"
      required
    ></v-text-field>

    <!-- Display error message below form if login fails -->
    <v-alert v-if="errorMessage" type="error" class="mt-4">
      {{ errorMessage }}
    </v-alert>

    <!-- Additional message -->
    <v-alert type="info" color="customGreen" text class="mt-4 mb-4">
      <strong>Note:</strong> Only guards registered in the organization or school can sign in.
      Students should go to the
      <strong>
        <router-link
          to="/visitor"
          style="text-decoration: underline; color: inherit; cursor: pointer"
        >
          Visitor Page
        </router-link> </strong
      >.
    </v-alert>

    <!-- Use v-row to layout the Login button and Forgot Password link -->
    <v-row>
      <v-col class="text-left">
        <span
          text
          @click="onForgotPassword"
          style="text-transform: none; text-decoration: underline; cursor: pointer"
        >
          Forgot Password?
        </span>
      </v-col>
      <v-spacer></v-spacer>
      <v-col class="text-right">
        <v-btn
          :loading="loading"
          color="customGreen"
          @click="onLogin"
          style="width: 90px; height: 40px; font-size: 18px"
        >
          Login
        </v-btn>
      </v-col>
    </v-row>

    <!-- Forgot Password Modal -->
    <v-dialog
      v-model="forgotPasswordDialog"
      max-width="500"
      elevation="10"
      style="backdrop-filter: blur(8px)"
    >
      <v-card class="px-6 py-6" elevation="12" rounded="xl" style="background-color: #e6ffb1">
        <v-card-title class="headline"><strong>Reset Password</strong></v-card-title>
        <v-card-text>
          <v-form v-model="valid" lazy-validation>
            <v-text-field
              v-model="emailForReset"
              :rules="[rules.required, rules.email]"
              label="Email"
              prepend-icon="mdi-email"
              required
            ></v-text-field>
          </v-form>

          <v-alert v-if="emailSent" type="success" class="mt-4">
            A password reset link has been sent to your email.
          </v-alert>

          <v-alert v-if="errorMessage" type="error" class="mt-4">
            {{ errorMessage }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="forgotPasswordDialog = false">Cancel</v-btn>
          <v-btn color="customGreen" @click="onResetPassword">Send Reset Link</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-form>
</template>
