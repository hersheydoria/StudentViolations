<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { useRouter } from 'vue-router'
import { useStudentRecords } from '@/stores/useStudentRecords'

// Router setup to navigate to login page
const router = useRouter()
const goToLogin = () => {
  router.push('/login')
}

// Using the composable for student records
const {
  studentID,
  studentRecords,
  noRecordMessage,
  historyModalVisible,
  selectedStudent,
  handleEnterClick,
  showHistory,
  closeModal
} = useStudentRecords()
</script>

<template>
  <v-app>
    <AppLayout>
      <v-app-bar class="px-3" color="#e6ffb1">
        <v-avatar size="50" class="mx-auto">
          <!-- Increased profile picture size -->
          <v-img src="logo6.png" alt="Logo" />
        </v-avatar>
        <v-toolbar-title style="color: black">Visitor Page</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn text style="color: black; border: 2px solid green" @click="goToLogin">Log In</v-btn>
      </v-app-bar>

      <v-container>
        <div class="mt-1">
          <p style="color: white">Enter your student ID number</p>
        </div>

        <v-text-field
          v-model="studentID"
          label="ID Number"
          clearable
          class="mt-4"
          style="color: white"
        >
          <template v-slot:append>
            <v-btn
              @click="handleEnterClick"
              color="#286643"
              style="color: white; border: 2px solid #e6ffb1"
            >
              Enter
            </v-btn>
          </template>
        </v-text-field>

        <!-- Table for student records -->
        <v-table
          v-if="studentRecords.length > 0"
          class="mt-4"
          style="
            background-color: #e6ffb1;
            border: 1px solid #5ea34f;
            border-collapse: collapse;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            border-radius: 8px;
          "
        >
          <thead>
            <tr>
              <th
                style="
                  color: black;
                  padding: 8px;
                  border: 1px solid green;
                  font-weight: bold;
                  font-size: 16px;
                  text-align: center;
                "
              >
                Student ID
              </th>
              <th
                style="
                  color: black;
                  padding: 8px;
                  border: 1px solid green;
                  font-weight: bold;
                  font-size: 16px;
                  text-align: center;
                "
              >
                Name
              </th>
              <th
                style="
                  color: black;
                  padding: 8px;
                  border: 1px solid green;
                  font-weight: bold;
                  font-size: 16px;
                  text-align: center;
                "
              >
                Violations
              </th>
              <th
                style="
                  color: black;
                  padding: 8px;
                  border: 1px solid green;
                  font-weight: bold;
                  font-size: 16px;
                  text-align: center;
                "
              >
                Date Recorded
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in studentRecords" :key="record.id + record.violation">
              <td
                style="
                  color: black;
                  padding: 8px;
                  border: 1px solid green;
                  font-size: 16px;
                  text-align: center;
                "
              >
                {{ record.id }}
              </td>
              <td
                style="
                  color: black;
                  padding: 8px;
                  border: 1px solid green;
                  font-size: 16px;
                  text-align: center;
                "
              >
                {{ record.name }}
              </td>
              <td
                style="
                  color: black;
                  padding: 8px;
                  border: 1px solid green;
                  font-size: 16px;
                  text-align: center;
                "
              >
                {{ record.violation }}
              </td>
              <td
                style="
                  color: black;
                  padding: 8px;
                  border: 1px solid green;
                  font-size: 16px;
                  text-align: center;
                "
              >
                {{ record.dateRecorded }}
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Display No Record message if applicable -->
        <div
          v-if="noRecordMessage"
          class="mt-4"
          style="color: white; font-weight: bold; text-align: center"
        >
          {{ noRecordMessage }}
        </div>

        <!-- View History Button -->
        <v-btn
          v-if="studentRecords.length > 0"
          @click="showHistory(studentRecords[0])"
          color="#286643"
          class="mt-16"
          style="color: white; border: 2px solid #e6ffb1"
        >
          View History
        </v-btn>
      </v-container>

      <!-- History Modal -->
      <v-dialog v-model="historyModalVisible" max-width="600px">
        <v-card style="background-color: #e6ffb1">
          <v-card-title
            style="
              color: black;
              text-align: center;
              font-weight: bold;
              justify-content: center;
              display: flex;
              font-size: 18px;
            "
          >
            {{ selectedStudent?.name }}'s Record History
          </v-card-title>
          <v-card-text>
            <v-table v-if="selectedStudent?.records.length > 0">
              <thead>
                <tr>
                  <th style="padding: 10px; border: 1px solid green; text-align: center">
                    Violation
                  </th>
                  <th style="padding: 10px; border: 1px solid green; text-align: center">
                    Date Recorded
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in selectedStudent.records" :key="record.violation">
                  <td style="padding: 8px; text-align: center">{{ record.violation }}</td>
                  <td style="padding: 8px; text-align: center">{{ record.dateRecorded }}</td>
                </tr>
              </tbody>
            </v-table>
            <!-- Message for no historical record -->
            <div v-else style="color: black; font-weight: bold; text-align: center">
              No historical record
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              @click="closeModal"
              color="#286643"
              style="color: white; border: 2px solid #e6ffb1; margin: auto"
              >Close</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </AppLayout>
  </v-app>
</template>

<style scoped>
.v-btn {
  margin: 16px 0;
}
</style>
