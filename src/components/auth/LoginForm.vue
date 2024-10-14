<script setup>
import { ref } from 'vue'
//import { supabase } from './supabase' // Import Supabase client
import { useRouter } from 'vue-router'

// Form data
const userId = ref('')
const password = ref('')
const valid = ref(true)

// Forgot Password modal
const forgotPasswordDialog = ref(false)
const email = ref('') // Email for password reset
const emailSent = ref(false)
const errorMessage = ref('')

// Validation rules
const rules = {
  required: (value) => !!value || 'Required.',
  passwordMin: (v) => v.length >= 5 || 'Password must be at least 5 characters long',
  passwordMatch: (v) => v === email.value || 'Passwords must match',
  email: (value) => /.+@.+\..+/.test(value) || 'E-mail must be valid.'
}

// Router instance
const router = useRouter()

// Login logic
function onLogin() {
  if (valid.value) {
    console.log('User ID:', userId.value)
    console.log('Password:', password.value)
    router.push('/home')
  } else {
    console.log('Invalid form')
  }
}

// Open Forgot Password modal
function onForgotPassword() {
  forgotPasswordDialog.value = true
}

// Reset password logic using Supabase
async function onResetPassword() {
  if (valid.value) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email.value, {
        redirectTo: 'http://localhost:3000/reset-password' // URL for the reset page
      })

      if (error) {
        throw error
      }

      emailSent.value = true
      forgotPasswordDialog.value = false // Close modal after success
    } catch (error) {
      errorMessage.value = error.message
    }
  }
}
</script>

<template>
  <v-form v-model="valid" lazy-validation>
    <!-- User ID field -->
    <v-text-field
      v-model="userId"
      :rules="[rules.required]"
      label="User ID"
      prepend-icon="mdi-account"
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

    <!-- Add message below the form -->
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
      <!-- Add a spacer to push the Forgot Password link to the right -->
      <v-spacer></v-spacer>
      <v-col class="text-right">
        <v-btn
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
          <!-- Enter email for password reset -->
          <v-form v-model="valid" lazy-validation>
            <v-text-field
              v-model="email"
              :rules="[rules.required, rules.email]"
              label="Email"
              prepend-icon="mdi-email"
              required
            ></v-text-field>
          </v-form>

          <!-- Show success message if the email has been sent -->
          <v-alert v-if="emailSent" type="success" class="mt-4">
            A password reset link has been sent to your email.
          </v-alert>

          <!-- Show error message if there was an error -->
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
