<script setup></script>

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

  <!-- Footer with centered text -->
  <v-footer app class="px-3" style="background-color: #e6ffb1; color: black">
    <v-row>
      <v-col class="text-center"> © 2024 - Student Violations </v-col>
    </v-row>
  </v-footer>
</template>
