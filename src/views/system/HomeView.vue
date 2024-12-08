<script setup>
import { onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useViolationRecords } from '@/stores/useViolationRecords'
import { QrcodeStream } from 'vue3-qrcode-reader'

// Use the composable to get access to the methods and state
const {
  showForm,
  showLeftSidebar,
  newViolation,
  violations,
  history,
  headers,
  addViolation,
  unblockViolation,
  logout,
  showViewHistory,
  toggleViewHistory,
  toggleLeftSidebar,
  valid,
  selectedMethod,
  showQrScanner,
  showStudentInfoModal,
  selectedStudent,
  fetchViolations, // Fetch violations on mount
  showStudentDetails,
  onQrCodeScanned,
  onError,
  user,
  removeViolation,
  formatDate,
  showUnblockModal,
  searchQuery,
  filteredBlockedViolations,
  searchViolations,
  onUnblockAll,
  closeUnblockModal,
  showOtherViolationField,
  handleViolationTypeChange,
  violationTypesWithOthers
} = useViolationRecords()

// Validation function for the input
const validateInput = (value) => {
  const regex = /^[0-9-]*$/ // Only numbers and hyphens
  return regex.test(value) || "Only numbers and '-' are allowed."
}

// Fetch violations on component mount
onMounted(() => {
  fetchViolations()
  showOtherViolationField.value = true
})

// Function to remove a violation
const onRemoveViolation = async (id) => {
  try {
    await removeViolation(id) // Call the function to remove from Supabase
    // Filter out the removed violation from the local state
    violations.value = violations.value.filter((violation) => violation.id !== id)
  } catch (error) {
    console.error('Error removing violation:', error)
  }
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
              <v-img src="account.jpg" alt="Profile Picture" />
            </v-avatar>
          </v-list-item>
          <v-divider></v-divider>

          <v-list-item v-if="user">
            <p><strong>ID Number: </strong>{{ user.idNumber }}</p>
          </v-list-item>
          <v-divider></v-divider>

          <v-list-item v-if="user">
            <p><strong>Name: </strong>{{ user.fullname }}</p>
          </v-list-item>
          <v-divider></v-divider>

          <v-list-item v-if="user">
            <p><strong>Email: </strong></p>
            <p>{{ user.email }}</p>
          </v-list-item>
          <v-divider></v-divider>

          <v-list-item v-if="user">
            <p><strong>Role: </strong>{{ user.role }}</p>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item v-if="user">
            <v-divider></v-divider>
            <v-list-item
              @click="logout"
              style="color: black; border: 2px solid green; text-align: center"
              ><strong>LOGOUT</strong></v-list-item
            >
          </v-list-item>
          <v-list-item v-else>
            <p>No user currently signed in.</p>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <v-container fluid>
          <v-row class="d-flex justify-end align-center">
            <v-col cols="auto">
              <v-btn @click="showUnblockModal = true" color="#286643" class="customGreen">
                Search to Unblock
              </v-btn>
            </v-col>
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
                @click="toggleViewHistory"
                color="#286643"
                style="color: white; border: 2px solid #e6ffb1"
              >
                View History
              </v-btn>
            </v-col>
          </v-row>

          <!-- Violation Records Table -->
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
                <!-- Top Slot for Title -->
                <template #top>
                  <v-toolbar flat style="background-color: #e6ffb1">
                    <v-toolbar-title><strong>RECORDS</strong></v-toolbar-title>
                  </v-toolbar>
                </template>

                <!-- Student ID Slot with Details -->
                <template v-slot:item.student_id="{ item }">
                  <span v-if="item.student_id">
                    <v-btn @click="showStudentDetails(item.student_id)" color="green" text>
                      {{ item.student_id }}
                    </v-btn>
                  </span>
                  <span v-else>No Student Data</span>
                </template>

                <!-- Violation Type Slot -->
                <template v-slot:item.violation_type="{ item }">
                  <span>{{ item.violation_type || 'No Violation Type' }}</span>
                </template>

                <!-- Guard Name Slot -->
                <template v-slot:item.guard_name="{ item }">
                  <span>{{
                    item.guardFullName ? item.guardFullName + ' - Guard' : 'No Data'
                  }}</span>
                </template>

                <!-- Date Slot -->
                <template v-slot:item.violation_date="{ item }">
                  <span>{{ formatDate(item.violation_date) || 'No Date' }}</span>
                </template>

                <!-- Status Slot -->
                <template v-slot:item.status="{ item }">
                  <span>{{ item.status || 'No Status' }}</span>
                </template>

                <!-- Slot for Action Button -->
                <template v-slot:item.action="{ item }">
                  <v-btn
                    @click="unblockViolation(item.id)"
                    color="green"
                    style="margin-right: 10px; margin-bottom: 10px; margin-top: 10px"
                    >UNBLOCK</v-btn
                  >
                  <v-btn @click="onRemoveViolation(item.id)" color="red">REMOVE</v-btn>
                </template>
              </v-data-table>
            </v-col>
          </v-row>

          <!-- Student Info Modal -->
          <v-dialog
            v-model="showStudentInfoModal"
            max-width="600px"
            elevation="10"
            style="backdrop-filter: blur(8px)"
          >
            <v-card class="px-6 py-6" elevation="12" rounded="xl" style="background-color: #e6ffb1">
              <v-card-title class="headline"><strong>STUDENT DETAILS</strong></v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" class="text-center">
                    <v-avatar size="100">
                      <v-img :src="selectedStudent.image" alt="Profile Picture" />
                    </v-avatar>
                  </v-col>
                  <v-col cols="12">
                    <p><strong>Name:</strong> {{ selectedStudent.fullname }}</p>
                    <p><strong>Address:</strong> {{ selectedStudent.address }}</p>
                    <p><strong>Birthday:</strong> {{ selectedStudent.birthday }}</p>
                    <p><strong>Program:</strong> {{ selectedStudent.program }}</p>
                    <p><strong>Year:</strong> {{ selectedStudent.year }}</p>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="showStudentInfoModal = false">Close</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog
            v-model="showUnblockModal"
            max-width="600px"
            elevation="10"
            style="backdrop-filter: blur(8px)"
          >
            <v-card class="px-6 py-6" elevation="12" rounded="xl" style="background-color: #e6ffb1">
              <v-card-title>
                <span><strong>SEARCH AND UNBLOCK</strong></span>
              </v-card-title>
              <v-text-field
                v-model="searchQuery"
                label="Search by ID"
                clearable
                @keyup.enter="searchViolations"
                :rules="[validateInput]"
                class="mb-4"
                dense
              >
                <template #append>
                  <v-btn color="customGreen" @click="searchViolations" icon>
                    <v-icon>mdi-magnify</v-icon>
                  </v-btn>
                </template>
              </v-text-field>

              <v-btn class="mb-4" color="red" block @click="onUnblockAll">
                {{
                  filteredBlockedViolations.length
                    ? `Unblock All for Student ID ${filteredBlockedViolations[0]?.studentId || 'UNKNOWN'}`
                    : 'NO DATA AVAILABLE'
                }}
              </v-btn>

              <v-data-table
                :headers="[
                  {
                    text: 'ID Number',
                    value: 'student_id'
                  },
                  {
                    text: 'Violation Type',
                    value: 'violation_type'
                  },
                  {
                    text: 'Action',
                    value: 'action',
                    sortable: false
                  }
                ]"
                :items="filteredBlockedViolations"
                item-value="id"
                style="background-color: #e6ffb1"
                :items-per-page="5"
                :footer-props="{ 'items-per-page-options': [5] }"
              >
                <!-- Slots for displaying table data -->
                <template v-slot:item.student_id="{ item }">
                  <span v-if="item.student_id">
                    <v-btn @click="showStudentDetails(item.student_id)" color="green" text>
                      {{ item.student_id }}
                    </v-btn>
                  </span>
                  <span v-else>No Student Data</span>
                </template>
                <template v-slot:item.violation_type="{ item }">
                  <span>{{ item.violation_type }}</span>
                </template>
                <template v-slot:item.action="{ item }">
                  <v-btn color="green" @click="unblockViolation(item.id)"> Unblock </v-btn>
                </template>
              </v-data-table>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="closeUnblockModal">Close</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

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
                  <v-radio-group v-model="selectedMethod" label="Add Violation By">
                    <v-radio label="ID Number" value="idNumber" />
                    <v-radio label="Name" value="name" />
                    <v-radio label="QR Code" value="qrCode" />
                  </v-radio-group>

                  <!-- ID Number Field -->
                  <v-text-field
                    v-if="selectedMethod === 'idNumber'"
                    label="ID Number"
                    v-model="newViolation.studentId"
                    required
                    type="text"
                    :rules="[(v) => /^[0-9-]+$/.test(v) || 'Only numbers and hyphens are allowed']"
                  ></v-text-field>

                  <!-- Name Fields -->
                  <div v-if="selectedMethod === 'name'">
                    <v-text-field
                      label="First Name"
                      v-model="newViolation.firstName"
                      required
                    ></v-text-field>

                    <v-text-field
                      label="Last Name"
                      v-model="newViolation.lastName"
                      required
                    ></v-text-field>
                  </div>

                  <!-- QR Code -->
                  <v-btn
                    v-if="selectedMethod === 'qrCode'"
                    @click="showQrScanner = true"
                    color="#286643"
                    style="color: white; border: 2px solid #e6ffb1; margin-bottom: 10px"
                  >
                    Open QR Code Scanner
                  </v-btn>

                  <div v-if="selectedMethod === 'qrCode' && newViolation.studentId" class="mt-2">
                    <p>
                      Scanned Student ID: <strong>{{ newViolation.studentId }}</strong>
                    </p>
                  </div>

                  <!-- Violation Type -->
                  <v-select
                    label="Violation Type"
                    v-model="newViolation.type"
                    :items="violationTypesWithOthers"
                    @change="handleViolationTypeChange"
                    required
                  ></v-select>

                  <!-- Show "Others" text field conditionally -->
                  <div v-if="showOtherViolationField">
                    <!-- Informational Text -->
                    <v-alert type="info" elevation="2" class="mb-2" color="customGreen">
                      Please specify the violation as you selected the "Others" option.
                    </v-alert>
                    <!-- Text Field -->
                    <v-text-field
                      label="Specify Violation"
                      v-model="newViolation.otherType"
                      required
                    />
                  </div>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="showForm = false" color="grey">Cancel</v-btn>

                <v-btn :disabled="!valid" @click="addViolation">
                  <span>Add</span>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- QR Code Scanner Modal -->
          <v-dialog
            v-model="showQrScanner"
            max-width="600px"
            elevation="10"
            style="backdrop-filter: blur(8px)"
          >
            <v-card class="px-6 py-6" elevation="12" rounded="xl" style="background-color: #e6ffb1">
              <v-card-title>Scan QR Code</v-card-title>
              <v-card-text>
                <QrcodeStream @decode="onQrCodeScanned" @error="onError" />
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="showQrScanner = false">Close</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- Violation History -->
          <v-dialog
            v-model="showViewHistory"
            max-width="800px"
            elevation="10"
            style="backdrop-filter: blur(8px)"
          >
            <v-card class="px-6 py-6" elevation="12" rounded="xl" style="background-color: #e6ffb1">
              <v-card-title class="headline"><strong>VIOLATION HISTORY</strong></v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="[
                    { text: 'Student ID', value: 'student_id' },
                    { text: 'Violation Type', value: 'violation_type' },
                    { text: 'Recorded By', value: 'guard_name' },
                    { text: 'Status', value: 'status' }
                  ]"
                  :items="history"
                  item-value="id"
                  class="mt-5"
                  :items-per-page="5"
                  :footer-props="{ 'items-per-page-options': [5] }"
                  style="background-color: #e6ffb1"
                >
                  <!-- Student ID Slot with Details -->
                  <template v-slot:item.student_id="{ item }">
                    <span v-if="item.student_id">
                      <v-btn @click="showStudentDetails(item.student_id)" color="green" text>
                        {{ item.student_id }}
                      </v-btn>
                    </span>
                    <span v-else>No Student Data</span>
                  </template>
                  <!-- Guard Name Slot -->
                  <template v-slot:item.guard_name="{ item }">
                    <span>{{ item.guardFullName || 'No Data' }}</span>
                  </template>
                </v-data-table>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="showViewHistory = false">Close</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
      </v-main>
    </AppLayout>
  </v-app>
</template>

<style scoped>
.customGreen {
  background-color: #286643;
  color: white;
  border: 2px solid #e6ffb1;
}
/* Ensure headers are visible */
.v-data-table-header th {
  display: table-cell !important;
  color: #333 !important; /* Change color to be visible */
  font-weight: bold;
  background-color: #f5f5f5; /* Light background for contrast */
}
</style>
