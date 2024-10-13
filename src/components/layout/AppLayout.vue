<script setup></script>

<template>
  <!-- Container that wraps the slot content -->
  <v-container
    fluid
    class="fill-height d-flex align-center justify-center"
    style="background-color: #006400"
  >
    <!-- Slot for injected content (e.g., the login form) -->
    <slot></slot>
  </v-container>

  <!-- Footer with centered text -->
  <v-footer app class="px-3" style="background-color: #2e7d32; color: white">
    <v-row>
      <v-col class="text-center"> © 2024 - Student Violations </v-col>
    </v-row>
  </v-footer>
</template>
