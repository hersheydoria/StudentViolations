<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/stores/supabase'

const password = ref('')
const message = ref('')
const route = useRoute()

onMounted(() => {
  // Check if the access token is present in the query parameters
  if (!route.query.access_token) {
    message.value = 'Invalid or expired token.'
  }
})

async function updatePassword() {
  const { error } = await supabase.auth.api.updateUser({
    password: password.value,
    access_token: route.query.access_token // Pass the access token from the link
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
