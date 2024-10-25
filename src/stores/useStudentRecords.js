import { ref, watch } from 'vue'

// Student data (mock data for demonstration)
const studentsData = [
  { id: '221-00598', name: 'May Estroga', violation: 'Dress Code', dateRecorded: '2024-10-15' },
  {
    id: '221-00598',
    name: 'May Estroga',
    violation: 'None Wearing ID',
    dateRecorded: '2024-10-16'
  },
  {
    id: '221-00599',
    name: 'Hershey Doria',
    violation: 'Late submission',
    dateRecorded: '2024-01-20'
  },
  { id: '221-00600', name: 'Rovannah Delola', violation: 'Absent', dateRecorded: '2024-02-05' }
]

// Historical records for the students
const historyData = [
  {
    id: '221-00598',
    name: 'May Estroga',
    violation: 'Ignoring Flag Ceremony',
    dateRecorded: '2024-09-15'
  },
  {
    id: '221-00598',
    name: 'May Estroga',
    violation: 'Unauthorized Use CSU Management',
    dateRecorded: '2024-09-16'
  },
  { id: '221-00600', name: 'Rovannah Delola', violation: 'Gambling', dateRecorded: '2024-09-31' }
]

// Composable to handle student records
export function useStudentRecords() {
  const studentID = ref('') // The student's ID input
  const studentRecords = ref([]) // To store records for the student
  const noRecordMessage = ref('') // Message for no record
  const historyModalVisible = ref(false) // Control visibility of the history modal
  const selectedStudent = ref(null) // To store the selected student

  // Function to handle ID input when Enter button is clicked
  function handleEnterClick() {
    const student = studentsData.filter((s) => s.id === studentID.value)

    if (student.length > 0) {
      studentRecords.value = student
      noRecordMessage.value = '' // Clear no record message
    } else {
      studentRecords.value = [] // Clear records if no student found
      noRecordMessage.value = 'No Record' // Set no record message
    }
  }

  // Function to open the history modal
  function showHistory(record) {
    // Fetch historical records based on student ID
    const historicalRecords = historyData.filter((h) => h.id === record.id)

    selectedStudent.value = {
      name: record.name, // Keep the selected student's name
      records: historicalRecords
    }

    historyModalVisible.value = true
  }

  // Function to close the modal
  const closeModal = () => {
    historyModalVisible.value = false // Just hide the modal
  }

  // Watch for changes in studentID and clear studentRecords if empty
  watch(studentID, (newVal) => {
    if (!newVal) {
      studentRecords.value = [] // Clear records when input is cleared
      noRecordMessage.value = '' // Clear no record message
    }
  })

  return {
    studentID,
    studentRecords,
    noRecordMessage,
    historyModalVisible,
    selectedStudent,
    handleEnterClick,
    showHistory,
    closeModal
  }
}
