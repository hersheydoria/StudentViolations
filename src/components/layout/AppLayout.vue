<script setup>
import { ref } from 'vue'

const showAbout = ref(false)
</script>

<template>
  <!-- Container that wraps the slot content -->
  <v-container
    fluid
    class="fill-height d-flex align-center justify-center"
    style="background-color: #286643"
  >
    <!-- Slot for injected content (e.g., the login form) -->
    <slot></slot>
  </v-container>

  <!-- Footer with centered text and About Developers link -->
  <v-footer app class="px-3" style="background-color: #e6ffb1; color: black">
    <v-row>
      <v-col class="text-center">
        © 2024 - Student Violations <br />
        <span @click="showAbout = true" style="cursor: pointer; text-decoration: underline">
          About the Developers
        </span>
      </v-col>
    </v-row>
  </v-footer>

  <!-- About Developers Modal -->
  <v-dialog v-model="showAbout" max-width="500px" elevation="10" style="backdrop-filter: blur(8px)">
    <v-card class="px-6 py-6" elevation="12" rounded="xl" style="background-color: #e6ffb1">
      <v-card-title class="text-h5"><strong>About the Developers</strong></v-card-title>
      <v-card-text>
        <p>
          <strong>System Analyst:</strong> May Estroga
          <!-- GitHub and WhatsApp for Analyst -->
          <v-spacer></v-spacer>

          <a href="https://github.com/mayestroga" target="_blank" class="ml-2">
            <v-icon color="black">mdi-github</v-icon>
          </a>
          <a href="https://wa.me/+639975000713" target="_blank" class="ml-2">
            <v-icon color="green">mdi-whatsapp</v-icon>
          </a>
        </p>

        <p>
          <strong>Lead Developer:</strong> Hershey C. Doria
          <!-- GitHub and WhatsApp for Lead developer -->
          <v-spacer></v-spacer>
          <a href="https://github.com/hersheydoria" target="_blank" class="ml-2">
            <v-icon color="black">mdi-github</v-icon>
          </a>
          <a href="https://wa.me/+639700919275" target="_blank" class="ml-2">
            <v-icon color="green">mdi-whatsapp</v-icon>
          </a>
        </p>
        <p>
          <strong>Frontend Developer:</strong> Rovannah E. Delola
          <!-- GitHub and WhatsApp for Frontend Developer -->
          <v-spacer></v-spacer>
          <a href="https://github.com/rovannahdelola" target="_blank" class="ml-2">
            <v-icon color="black">mdi-github</v-icon>
          </a>
          <a href="https://wa.me/+639060316074" target="_blank" class="ml-2">
            <v-icon color="green">mdi-whatsapp</v-icon>
          </a>
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="customGreen" @click="showAbout = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
