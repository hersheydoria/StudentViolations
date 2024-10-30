<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/stores/supabase'

const password = ref('')
const message = ref('')
const route = useRoute()
const accessToken = ref('') // Declare accessToken as a ref

onMounted(() => {
  // Check if the access token is present in the query parameters
  if (!route.query.access_token) {
    message.value = 'Invalid or expired token.'
  } else {
    // Get the access token from the URL query parameters
    accessToken.value = route.query.access_token
  }
})

async function updatePassword() {
  // Only proceed if the access token is available
  if (!accessToken.value) {
    message.value = 'Invalid or expired token.'
    return
  }

  const { error } = await supabase.auth.api.updateUser({
    password: password.value,
    access_token: accessToken.value // Use the reactive access token
  })

  if (error) {
    message.value = 'Error: ' + error.message
  } else {
    message.value = 'Password updated successfully!'
  }
}
</script>

<template>
  <div>
    <h1>Set New Password</h1>
    <form @submit.prevent="updatePassword">
      <input type="password" v-model="password" placeholder="New Password" required />
      <button type="submit">Update Password</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<style>
/* Add any styles you need */
</style>
