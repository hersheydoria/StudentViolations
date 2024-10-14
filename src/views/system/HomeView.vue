<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Reactive variables
const router = useRouter()
const showForm = ref(false)
const showLeftSidebar = ref(false)
const showRightSidebar = ref(false)
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
  'Dress Code Violation',
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
  const index = violations.value.findIndex(v => v.id === violationId);
  if (index !== -1) {
    const unblockedViolation = violations.value[index];
    unblockedViolation.status = 'Unblocked'; // Change status to 'Unblocked'
    history.value.push(unblockedViolation); // Add to history
    violations.value.splice(index, 1); // Remove from current violations
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
      <v-app-bar class="px-3" color="green lighten-1">
        <v-btn icon @click="toggleLeftSidebar">
          <v-icon>mdi-menu</v-icon>
        </v-btn>

        <v-toolbar-title>Student Violation System</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-app-bar>

      <!-- Left Sidebar -->
      <v-navigation-drawer
        v-model="showLeftSidebar"
        app
        width="256"
        mini-width="56"
        color="green"
      >
        <v-list>
          <v-list-item class="text-center">
            <v-avatar size="150" class="mx-auto"> <!-- Increased profile picture size -->
              <v-img src="https://via.placeholder.com/100" alt="Profile Picture" />
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

      <!-- Right Sidebar (if needed) -->
      <v-navigation-drawer v-model="showRightSidebar" temporary app right>
        <v-list>
          <v-list-item class="text-center">
            <v-avatar size="120" class="mx-auto"> <!-- Increased profile picture size -->
              <v-img src="https://via.placeholder.com/100" alt="Profile Picture" />
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
        <v-container fluid>
          <v-row>
            <v-col cols="12" class="d-flex align-center justify-space-between">
              <v-btn @click="showForm = true" color="green">Add Violation</v-btn>
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
              >
                <template #top>
                  <v-toolbar flat>
                    <v-toolbar-title>Violation Records</v-toolbar-title>
                  </v-toolbar>
                </template>
                <template v-slot:item.action="{ item }">
                  <v-btn @click="unblockViolation(item.id)" color="green">UNBLOCK</v-btn>
                </template>
              </v-data-table>

              <!-- Align buttons to the right at the bottom of the table -->
              <v-row class="justify-end mt-3">
                <v-col cols="auto">
                  <v-btn @click="showHistory" color="green">View History</v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- Add Violation Modal -->
          <v-dialog v-model="showForm" max-width="600px">
            <v-card>
              <v-card-title>Add Violation</v-card-title>
              <v-card-text>
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
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="showForm = false" color="grey">Cancel</v-btn>
                <v-btn @click="addViolation" color="pink">Add</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- View History Modal -->
          <v-dialog v-model="showViewHistory" max-width="600px">
            <v-card>
              <v-card-title>History</v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="headers"
                  :items="history"
                  item-value="id"
                  class="mt-5"
                  :footer-props="{ 'items-per-page-options': [] }"
                >
                  <template #top>
                    <v-toolbar flat>
                      <v-toolbar-title>Violation History</v-toolbar-title>
                    </v-toolbar>
                  </template>
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
