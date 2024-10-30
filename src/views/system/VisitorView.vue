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
  loading,
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

        <!-- Loading Indicator -->
        <v-progress-linear v-if="loading" indeterminate color="#286643"></v-progress-linear>

        <!-- Violation Records Table -->
        <v-row>
          <v-col cols="12">
            <v-data-table
              :headers="[
                { text: 'Violation Type', value: 'violation_type' },
                { text: 'Recorded By', value: 'guard_name' },
                { text: 'Date', value: 'violation_date' },
                { text: 'Status', value: 'status' }
              ]"
              :items="studentRecords"
              item-value="id"
              class="mt-5"
              :footer-props="{ 'items-per-page-options': [] }"
              style="background-color: #e6ffb1"
            >
              <!-- Top Slot for Title -->
              <template #top>
                <v-toolbar flat style="background-color: #e6ffb1">
                  <v-toolbar-title
                    ><strong>
                      {{
                        selectedStudent?.fullName
                          ? `${selectedStudent.fullName}'s RECORD`
                          : 'RECORD'
                      }}
                    </strong></v-toolbar-title
                  >
                </v-toolbar>
              </template>

              <!-- Violation Type Slot -->
              <template v-slot:item.violation_type="{ item }">
                <span>{{ item.violation_type || 'No Violation Type' }}</span>
              </template>

              <!-- Guard Name Slot -->
              <template v-slot:item.guard_name="{ item }">
                <span>{{ item.guardFullName ? item.guardFullName + ' - Guard' : 'No Data' }}</span>
              </template>

              <!-- Date Slot -->
              <template v-slot:item.violation_date="{ item }">
                <span>{{ new Date(item.violation_date).toLocaleString() || 'No Date' }}</span>
              </template>

              <!-- Status Slot -->
              <template v-slot:item.status="{ item }">
                <span>{{ item.status || 'No Status' }}</span>
              </template>
            </v-data-table>

            <!-- View History Button placed after the table -->
            <v-btn @click="showHistory" color="green" class="mt-3" style="width: 100%">
              View History
            </v-btn>
          </v-col>
        </v-row>

        <!-- Display No Record message if applicable -->
        <div
          v-if="noRecordMessage"
          class="mt-4"
          style="color: white; font-weight: bold; text-align: center"
        >
          {{ noRecordMessage }}
        </div>
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
            {{
              studentID
                ? `${selectedStudent?.fullName || 'Unknown Student'}'s RECORD HISTORY`
                : 'HISTORY'
            }}
          </v-card-title>
          <v-card-text>
            <template v-if="selectedStudent?.records && selectedStudent.records.length > 0">
              <v-data-table
                :headers="[
                  { text: 'Violation Type', value: 'violation_type' },
                  { text: 'Recorded By', value: 'guard_name' },
                  { text: 'Status', value: 'status' }
                ]"
                :items="selectedStudent.records"
                item-value="id"
                class="mt-5"
                :footer-props="{ 'items-per-page-options': [] }"
                style="background-color: #e6ffb1"
              >
                <!-- Guard Name Slot -->
                <template v-slot:item.guard_name="{ item }">
                  <span>{{
                    item.guardFullName ? item.guardFullName + ' - Guard' : 'No Data'
                  }}</span>
                </template>
              </v-data-table>
            </template>
            <div v-else style="color: black; font-weight: bold; text-align: center">
              No historical record
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              @click="closeModal"
              color="#286643"
              style="color: black; border: 2px solid #e6ffb1; margin: auto"
            >
              Close
            </v-btn>
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
