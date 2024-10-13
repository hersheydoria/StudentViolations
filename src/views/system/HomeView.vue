<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Reactive variables
const router = useRouter();
const showForm = ref(false);
const newViolation = ref({
  studentId: '',
  type: '',
});
const violations = ref([]); // Your existing violation data
const headers = [
  { text: 'Student ID', value: 'studentId' },
  { text: 'Violation Type', value: 'type' },
  { text: 'Date', value: 'date' },
  { text: 'Recorded By', value: 'recordedBy' },
];
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
  'None Wearing ID',
];

// State variables for modals
const showViewHistory = ref(false);
const showViewStatus = ref(false);

// Sample student data with their status
const students = ref([
  { id: '123456', name: 'John Doe', status: 'Blocked' },
  { id: '789012', name: 'Jane Smith', status: 'Unblocked' },
  { id: '345678', name: 'Alice Johnson', status: 'Blocked' },
  { id: '901234', name: 'Bob Brown', status: 'Unblocked' },
]);

// Methods
const addViolation = () => {
  violations.value.push({
    id: violations.value.length + 1, // Example ID generation
    studentId: newViolation.value.studentId,
    type: newViolation.value.type,
    date: new Date().toLocaleDateString(), // Add current date
    recordedBy: 'Guard', // Example recordedBy, adjust as needed
  });
  newViolation.value.studentId = '';
  newViolation.value.type = '';
  showForm.value = false;
};

// Logout method
const logout = () => {
  localStorage.removeItem('authToken'); // Clear any token or session data
  router.push('/login'); // Redirect to login page after logout
};

// Method to show history
const showHistory = () => {
  showViewHistory.value = true; // Show history modal
};

// Method to show status
const showStatus = () => {
  showViewStatus.value = true; // Show status modal
};
</script>

<template>
  <v-app>
    <v-app-bar class="px-3" :color="'green lighten-1'">
      <v-toolbar-title>Student Violation Management</v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Hamburger Menu for Navigation -->
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn v-bind="props" icon>
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item class="text-center">
            <v-avatar size="100" class="mx-auto">
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
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="12" class="d-flex align-center justify-space-between">
            <!-- Add Violation button -->
            <v-btn @click="showForm = true" color="blue">Add Violation</v-btn>
            <!-- View History button -->
            <v-btn class="ml-5" @click="showHistory" color="green">View History</v-btn>
            <!-- View Status button -->
            <v-btn class="ml-5" @click="showStatus" color="orange">View Status</v-btn>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <!-- Violations Table with labeled headers -->
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

              <template #item="{ item }">
                <v-row>
                  <v-col cols="12">
                    <v-card class="mb-2">
                      <v-card-text>
                        <strong>Student ID:</strong> {{ item.studentId }} <br />
                        <strong>Violation Type:</strong> {{ item.type }} <br />
                        <strong>Date:</strong> {{ item.date }} <br />
                        <strong>Recorded By:</strong> {{ item.recordedBy }} <br />
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </template>
            </v-data-table>
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
            <v-card-title>View History</v-card-title>
            <v-card-text>
              <!-- Place your history information here -->
              <p>This is where the history would be displayed.</p>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="showViewHistory = false" color="grey">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- View Status Modal -->
        <v-dialog v-model="showViewStatus" max-width="600px">
          <v-card>
            <v-card-title>View Status</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item-group>
                  <v-list-item v-for="student in students" :key="student.id">
                    <v-list-item-content>
                      <v-list-item-title>{{ student.name }} (ID: {{ student.id }})</v-list-item-title>
                      <v-list-item-subtitle>Status: {{ student.status }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="showViewStatus = false" color="grey">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

      </v-container>
    </v-main>

    <!-- Footer left untouched as requested -->
    <v-footer app class="px-3" :color="'green lighten-1'">
      <v-row>
        <v-col class="text-center"> © 2024 - Student Violations </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>
