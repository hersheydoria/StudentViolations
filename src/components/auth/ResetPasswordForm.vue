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

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase' // Adjust the path as necessary
import { useRoute } from 'vue-router'

const password = ref('')
const message = ref('')
const route = useRoute()

async function updatePassword() {
  const { error } = await supabase.auth.api.updateUser({
    password: password.value,
    access_token: route.query.access_token // Pass the access token from the link
  })

  if (error) {
    message.value = 'Error: ' + error.message
  } else {
    message.value = 'Password updated successfully!'
    // Emit an event to inform the parent component about success
    emit('reset-success')
  }
}
</script>

<style>
/* Add any styles you need */
</style>
