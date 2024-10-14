<script setup>
import AppLayout from '@/components/layout/AppLayout.vue';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

// Router setup to navigate to login page
const router = useRouter();

// Function to handle Log In button click
const goToLogin = () => {
  router.push('/login'); // Assuming '/login' is the route for your login page
};

// Student data (mock data for demonstration)
const studentsData = [
  { id: '221-00598', name: 'May Estroga', violation: 'Dress Code', dateRecorded: '2024-10-15' },
  { id: '221-00598', name: 'May Estroga', violation: 'None Wearing ID', dateRecorded: '2024-10-16' },
  { id: '221-00599', name: 'Hershey Doria', violation: 'Late submission', dateRecorded: '2024-01-20' },
  { id: '221-00600', name: 'Rovannah Delola', violation: 'Absent', dateRecorded: '2024-02-05' }
];

// Historical records for the students (these should be different from the student records)
const historyData = [
  { id: '221-00598', name: 'May Estroga', violation: 'Ignoring Flag Ceremony', dateRecorded: '2024-09-15' },
  { id: '221-00598', name: 'May Estroga', violation: 'Unauthorized Use CSU Management', dateRecorded: '2024-09-16' },
  { id: '221-00600', name: 'Rovannah Delola', violation: 'Gambling', dateRecorded: '2024-09-31' }
];

const studentID = ref(''); // The student's ID input
const studentRecords = ref([]); // To store records for the student
const noRecordMessage = ref(''); // Message for no record
const historyModalVisible = ref(false); // Control visibility of the history modal
const selectedStudent = ref(null); // To store the selected student

// Function to handle ID input when Enter button is clicked
function handleEnterClick() {
  const student = studentsData.filter(s => s.id === studentID.value);
  
  if (student.length > 0) {
    studentRecords.value = student;
    noRecordMessage.value = ''; // Clear no record message
  } else {
    studentRecords.value = []; // Clear records if no student found
    noRecordMessage.value = 'No Record'; // Set no record message
  }
}

// Function to open the history modal
function showHistory(record) {
  // Fetch historical records based on student ID
  const historicalRecords = historyData.filter(h => h.id === record.id);
  
  selectedStudent.value = {
    name: record.name, // Keep the selected student's name
    records: historicalRecords
  };
  
  historyModalVisible.value = true;
}

// Function to close the modal
const closeModal = () => {
  historyModalVisible.value = false; // Just hide the modal, do not clear studentRecords
};

// Watch for changes in studentID and clear studentRecords if empty
watch(studentID, (newVal) => {
  if (!newVal) {
    studentRecords.value = []; // Clear records when input is cleared
    noRecordMessage.value = ''; // Clear no record message
  }
});
</script>

<template>
  <v-app>
    <AppLayout>
      <v-app-bar class="px-3" color="#e6ffb1">
        <v-toolbar-title style="color: black;">Visitor Page</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn text style="color: black; border: 2px solid green;" @click="goToLogin">Log In</v-btn>
      </v-app-bar>

      <v-container>
        <div class="mt-1">
          <p style="color: white;">Enter your student ID number</p>
        </div>

        <v-text-field
          v-model="studentID"
          label="ID Number"
          clearable
          class="mt-4"
          style="color: white;"
        >
          <template v-slot:append>
            <v-btn @click="handleEnterClick" color="#286643" style="color: white; border: 2px solid #E6FFB1;">
              Enter
            </v-btn>
          </template>
        </v-text-field>

        <!-- Table for student records -->
        <v-table v-if="studentRecords.length > 0" class="mt-4" style="background-color: #E6FFB1; border: 1px solid #5ea34f; border-collapse: collapse; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); border-radius: 8px;">
          <thead>
            <tr>
              <th style="color: black; padding: 8px; border: 1px solid green; font-weight: bold; font-size: 16px; text-align: center;">Student ID</th>
              <th style="color: black; padding: 8px; border: 1px solid green; font-weight: bold; font-size: 16px; text-align: center;">Name</th>
              <th style="color: black; padding: 8px; border: 1px solid green; font-weight: bold; font-size: 16px; text-align: center;">Violations</th>
              <th style="color: black; padding: 8px; border: 1px solid green; font-weight: bold; font-size: 16px; text-align: center;">Date Recorded</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in studentRecords" :key="record.id + record.violation">
              <td style="color: black; padding: 8px; border: 1px solid green; font-size: 16px; text-align: center;">{{ record.id }}</td>
              <td style="color: black; padding: 8px; border: 1px solid green; font-size: 16px; text-align: center;">{{ record.name }}</td>
              <td style="color: black; padding: 8px; border: 1px solid green; font-size: 16px; text-align: center;">{{ record.violation }}</td>
              <td style="color: black; padding: 8px; border: 1px solid green; font-size: 16px; text-align: center;">{{ record.dateRecorded }}</td>
            </tr>
          </tbody>
        </v-table>

        <!-- Display No Record message if applicable -->
        <div v-if="noRecordMessage" class="mt-4" style="color: white; font-weight: bold; text-align: center;">
          {{ noRecordMessage }}
        </div>

        <!-- View History Button -->
        <v-btn
          v-if="studentRecords.length > 0"
          @click="showHistory(studentRecords[0])"
          color="#286643"
          class="mt-16"
          style="color: white; border: 2px solid #E6FFB1;"
        >
          View History
        </v-btn>
      </v-container>

      <!-- History Modal -->
      <v-dialog v-model="historyModalVisible" max-width="600px">
        <v-card style="background-color: #E6FFB1;">
          <v-card-title style="color: black; text-align: center; font-weight: bold; justify-content: center; display: flex; font-size: 18px;">
            {{ selectedStudent?.name }}'s Record History
          </v-card-title>
          <v-card-text>
            <v-table style="background-color: transparent">
              <thead>
                <tr>
                  <th style="color: black; border: 1px solid black; font-weight: bold; font-size: 16px; text-align: center;">Violation</th>
                  <th style="color: black; border: 1px solid black; font-weight: bold; font-size: 16px; text-align: center;">Date Recorded</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="selectedStudent?.records.length > 0">
                  <tr v-for="(history, index) in selectedStudent.records" :key="index">
                    <td style="color: black; border: 1px solid black; font-size: 16px; text-align: center;">{{ history.violation }}</td>
                    <td style="color: black; border: 1px solid black; font-size: 16px; text-align: center;">{{ history.dateRecorded }}</td>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <td colspan="2" style="color: black; font-size: 16px; text-align: center;">No History</td>
                  </tr>
                </template>
              </tbody>
            </v-table>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="closeModal" color="black" style="color: white;">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </AppLayout>
  </v-app>
</template>
