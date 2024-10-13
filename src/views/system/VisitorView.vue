<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router'; // Import the Vue Router

// Theme setup
const theme = ref(localStorage.getItem('theme') ?? 'light');

// Theme toggle function
const onClick = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', theme.value);
};

// Router setup to navigate to login page
const router = useRouter();

// Function to handle Log In button click
const goToLogin = () => {
  router.push('/login'); // Assuming '/login' is the route for your login page
};

// Student data (mock data for demonstration)
const studentsData = [
  { id: '221-00598', name: 'May Estroga', violations: 'Dress Code', dateRecorded: '2024-10-15' },
  { id: '221-00599', name: 'Hershey Doria', violations: 'Late submission', dateRecorded: '2024-01-20' },
  { id: '221-00600', name: 'Rovannah Delola', violations: 'Absent', dateRecorded: '2024-02-05' },
];

const studentID = ref(''); // The student's ID input
const studentRecords = ref([]); // To store records for the student
const historyModalVisible = ref(false); // Control visibility of the history modal
const selectedStudent = ref(null); // To store the selected student

// Function to handle ID input when Enter button is clicked
function handleEnterClick() {
  // Find the student by ID
  const student = studentsData.find(s => s.id === studentID.value);
  if (student) {
    // Store the student's records
    studentRecords.value = [
      { id: student.id, name: student.name, violations: student.violations, dateRecorded: student.dateRecorded }
    ];
  } else {
    studentRecords.value = []; // Reset records if no student found
  }
}

// Function to open the history modal
function showHistory(record) {
  selectedStudent.value = record; // Set selected student record
  historyModalVisible.value = true; // Show the modal
}

// Set theme on mounted
onMounted(() => {
  document.body.setAttribute('data-theme', theme.value);
});

// Watch for theme changes
watch(theme, (newTheme) => {
  document.body.setAttribute('data-theme', newTheme);
});
</script>

<template>
  <v-app :theme="theme">
    <v-app-bar class="px-3" :color="theme === 'light' ? 'green lighten-1' : 'green darken-3'">
      <!-- Updated Header -->
      <v-toolbar-title>Visitor Page</v-toolbar-title>

      <v-spacer></v-spacer> <!-- Spacer to push buttons to the right -->

      <!-- Log In button -->
      <v-btn text @click="goToLogin">Log In</v-btn>

      <!-- Theme toggle button -->
      <v-btn
        :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        variant="elevated"
        slim
        @click="onClick"
      ></v-btn>
    </v-app-bar>

    <v-container>
    

      <!-- Simple description before the search bar, aligned left -->
      <div class="mt-16">
        <p class="text-start">Enter your student ID number </p>
      </div>

      <!-- Search bar for Student ID with Enter button inside -->
      <v-text-field
        v-model="studentID"
        label="ID Number"
        clearable
        class="mt-4"
      >
        <template v-slot:append>
          <v-btn @click="handleEnterClick" color="primary">
            Enter <!-- Display the word "Enter" -->
          </v-btn>
        </template>
      </v-text-field>

      <!-- Display student records in a table with softer borders -->
      <v-table v-if="studentRecords.length > 0" class="mt-4" style="border: 1px solid #ccc; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Student ID</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Violations</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Date Recorded</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in studentRecords" :key="record.id">
            <td style="border: 1px solid #ddd; padding: 8px;">{{ record.id }}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">{{ record.name }}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">{{ record.violations }}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">{{ record.dateRecorded }}</td>
          </tr>
        </tbody>
      </v-table>

      <!-- View History Button Below the Table -->
      <v-btn v-if="studentRecords.length > 0" @click="showHistory(studentRecords[0])" color="blue" class="mt-4">View History</v-btn>
    </v-container>

    <!-- History Modal -->
    <v-dialog v-model="historyModalVisible" max-width="600px">
      <v-card>
        <v-card-title>{{ selectedStudent?.name }}'s Record History</v-card-title>
        <v-card-text>
          <v-table style="border: 1px solid #ccc; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px;">Violation</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Date Recorded</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="border: 1px solid #ddd; padding: 8px;">{{ selectedStudent?.violations }}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{{ selectedStudent?.dateRecorded }}</td>
              </tr>
              <!-- You can add more history records here if needed -->
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="historyModalVisible = false" color="grey">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Footer with centered text -->
    <v-footer app class="px-3" :color="theme === 'light' ? 'green lighten-1' : 'green darken-3'">
      <v-row>
        <v-col class="text-center">© 2024 - Student Violations</v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>
