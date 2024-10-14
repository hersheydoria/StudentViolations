<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Reactive variables
const router = useRouter()
const showForm = ref(false)
const showLeftSidebar = ref(false)
const newViolation = ref({
  studentId: '',
  type: ''
})
const violations = ref([]) // Current violation data
const history = ref([]) // History of violations
const headers = [
  { text: 'Student ID', value: 'studentId' },
  { text: 'Violation Type', value: 'type' },
  { text: 'Date', value: 'date' },
  { text: 'Recorded By', value: 'recordedBy' },
  { text: 'Status', value: 'status' },
  { text: 'Action', value: 'action', sortable: false }
]
const violationTypes = [
  'Dress Code',
  'Disruption Obstruction',
  'Gambling',
  'Bribery Receiving Bribe',
  'Having Abusive Affiliation',
  'Unauthorized Use CSU Management',
  'Blocking Publication',
  'Disregard Code Conduct',
  'Abuse Code Ceremony',
  'Violating Policies',
  'Ignoring Flag Ceremony',
  'None Wearing ID'
]

// State variables for modals
const showViewHistory = ref(false)

// Methods
const addViolation = () => {
  violations.value.push({
    id: violations.value.length + 1, // Example ID generation
    studentId: newViolation.value.studentId,
    type: newViolation.value.type,
    date: new Date().toLocaleDateString(), // Add current date
    recordedBy: 'Guard', // Example recordedBy, adjust as needed
    status: 'Blocked' // Initial status
  })
  newViolation.value.studentId = ''
  newViolation.value.type = ''
  showForm.value = false
}

// Method to unblock a violation
const unblockViolation = (violationId) => {
  const index = violations.value.findIndex((v) => v.id === violationId)
  if (index !== -1) {
    const unblockedViolation = violations.value[index]
    unblockedViolation.status = 'Unblocked' // Change status to 'Unblocked'
    history.value.push(unblockedViolation) // Add to history
    violations.value.splice(index, 1) // Remove from current violations
  }
}

// Logout method
const logout = () => {
  localStorage.removeItem('authToken') // Clear any token or session data
  router.push('/login') // Redirect to login page after logout
}

// Method to show history
const showHistory = () => {
  showViewHistory.value = true // Show history modal
}

// Toggle Left Sidebar
const toggleLeftSidebar = () => {
  showLeftSidebar.value = !showLeftSidebar.value
}
</script>

<template>
  <v-app>
    <AppLayout>
      <v-app-bar class="px-3" style="background-color: #e6ffb1">
        <v-btn icon @click="toggleLeftSidebar">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <v-avatar size="50" class="mx-auto">
          <!-- Increased profile picture size -->
          <v-img src="logo6.png" alt="Logo" />
        </v-avatar>
        <v-toolbar-title>Home Page</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-app-bar>

      <!-- Left Sidebar -->
      <v-navigation-drawer
        v-model="showLeftSidebar"
        app
        width="256"
        mini-width="56"
        style="background-color: rgba(230, 255, 177, 0.7); backdrop-filter: blur(10px)"
      >
        <v-list>
          <v-list-item class="text-center">
            <v-avatar size="150" class="mx-auto">
              <!-- Increased profile picture size -->
              <v-img src="account.jpg" alt="Profile Picture" />
            </v-avatar>
          </v-list-item>
          <v-list-item>
            <p><strong>ID Number:</strong></p>
          </v-list-item>
          <v-list-item>
            <p><strong>Name:</strong></p>
          </v-list-item>
          <v-list-item>
            <p><strong>Email:</strong></p>
          </v-list-item>
          <v-list-item>
            <p><strong>Role:</strong></p>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="logout">Logout</v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <v-container fluid style="margin-top: -300px">
          <v-row class="d-flex justify-end align-center">
            <v-col cols="auto">
              <v-btn
                @click="showForm = true"
                color="#286643"
                style="color: white; border: 2px solid #e6ffb1"
              >
                Add Violation
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn
                @click="showHistory"
                color="#286643"
                style="color: white; border: 2px solid #e6ffb1"
              >
                View History
              </v-btn>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-data-table
                :headers="headers"
                :items="violations"
                item-value="id"
                class="mt-5"
                :footer-props="{ 'items-per-page-options': [] }"
                style="background-color: #e6ffb1"
              >
                <template #top>
                  <v-toolbar flat style="background-color: #e6ffb1">
                    <v-toolbar-title><strong>RECORDS</strong></v-toolbar-title>
                  </v-toolbar>
                </template>

                <!-- This is where you define the custom slot for the "Action" column -->
                <template v-slot:item.action="{ item }">
                  <v-btn @click="unblockViolation(item.id)" color="green">UNBLOCK</v-btn>
                </template>
              </v-data-table>
            </v-col>
          </v-row>

          <!-- Add Violation Modal -->
          <v-dialog
            v-model="showForm"
            max-width="600px"
            elevation="10"
            style="backdrop-filter: blur(8px)"
          >
            <v-card class="px-6 py-6" elevation="12" rounded="xl" style="background-color: #e6ffb1">
              <v-card-title class="headline"><strong>ADD VIOLATION</strong></v-card-title>
              <v-card-text>
                <v-form v-model="valid" lazy-validation>
                  <v-text-field
                    label="ID Number"
                    v-model="newViolation.studentId"
                    required
                  ></v-text-field>
                  <v-select
                    label="Violation Type"
                    v-model="newViolation.type"
                    :items="violationTypes"
                    required
                  ></v-select>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="showForm = false" color="grey">Cancel</v-btn>
                <v-btn @click="addViolation" color="customGreen">Add</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- View History Modal -->
          <v-dialog
            v-model="showViewHistory"
            max-width="600px"
            elevation="10"
            style="backdrop-filter: blur(8px)"
          >
            <v-card class="px-6 py-6" elevation="12" rounded="xl" style="background-color: #e6ffb1">
              <v-card-title class="headline"><strong>HISTORY</strong></v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="headers"
                  :items="history"
                  item-value="id"
                  class="mt-5"
                  :footer-props="{ 'items-per-page-options': [] }"
                  style="background-color: transparent"
                >
                </v-data-table>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="showViewHistory = false" color="grey">Close</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
      </v-main>
    </AppLayout>
  </v-app>
</template>
