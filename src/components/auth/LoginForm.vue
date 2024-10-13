<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Form data
const userId = ref('')
const password = ref('')
const valid = ref(true)

// Forgot Password modal
const forgotPasswordDialog = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')

// Validation rules
const rules = {
  required: (value) => !!value || 'Required.',
  passwordMin: (v) => v.length >= 5 || 'Password must be at least 5 characters long',
  passwordMatch: (v) => v === newPassword.value || 'Passwords must match'
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

// Reset password logic
function onResetPassword() {
  if (valid.value) {
    console.log('New Password:', newPassword.value)
    forgotPasswordDialog.value = false
    // Handle password reset logic here
    router.push('/login')
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
        <v-btn color="customGreen" @click="onLogin">Login</v-btn>
      </v-col>
    </v-row>

    <!-- Forgot Password Modal -->
    <v-dialog v-model="forgotPasswordDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Reset Password</v-card-title>
        <v-card-text>
          <!-- New password input fields in the modal -->
          <v-form v-model="valid" lazy-validation>
            <v-text-field
              v-model="newPassword"
              :rules="[rules.required, rules.passwordMin]"
              label="New Password"
              prepend-icon="mdi-lock"
              type="password"
              required
            ></v-text-field>
            <v-text-field
              v-model="confirmPassword"
              :rules="[rules.required, rules.passwordMatch]"
              label="Confirm Password"
              prepend-icon="mdi-lock"
              type="password"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="forgotPasswordDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="onResetPassword">Reset Password</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-form>
</template>
