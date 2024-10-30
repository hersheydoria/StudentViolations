import { ref, watch, onMounted } from 'vue'
import { supabase, SUPABASE_URL, SUPABASE_KEY } from './supabase'
import axios from 'axios'

// Composable to handle student records
export function useStudentRecords() {
  const studentID = ref('') // The student's ID input
  const studentRecords = ref([]) // To store records for the student
  const noRecordMessage = ref('') // Message for no record
  const historyModalVisible = ref(false) // Control visibility of the history modal
  const selectedStudent = ref(null) // To store the selected student
  const loading = ref(false) // Loading state
  const history = ref([])

  const getStudentByStudentId = async (studentId) => {
    const { data, error } = await supabase
      .from('students') // Ensure this matches your students table name
      .select('student_number, first_name, last_name') // Fetch first and last names as well
      .eq('student_number', studentId) // Match studentId to student_number
      .single() // Fetch a single student record

    if (error) {
      console.error(`Error fetching student data for student number: ${studentId}`, error)
      return null
    }

    return data
  }
  const getUserById = async (id) => {
    const { data, error } = await supabase.rpc('get_user_metadata', { user_id: id })

    if (error) {
      console.error(`Error fetching guard data for ID: ${id}`, error)
      return null
    }

    return data ? data[0] : null // Assuming data is an array with one result
  }

  // Function to fetch all student violations
  const fetchViolations = async () => {
    loading.value = true
    noRecordMessage.value = '' // Reset message on new fetch

    try {
      // Prepare the URL for fetching violations
      const url = `${SUPABASE_URL}/rest/v1/student_violations?select=id,violation_type,violation_date,status,recorded_by,student_id&student_id=eq.${studentID.value}`

      const { data, error } = await axios.get(url, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      })

      if (error) {
        console.error('Error fetching data from API:', error)
        noRecordMessage.value = 'Error fetching records: ' + (error.message || 'Unknown error')
        return
      }

      // If no records are found for the given student ID
      if (!Array.isArray(data) || data.length === 0) {
        noRecordMessage.value = 'No records found for this student ID'
        studentRecords.value = []
        return
      }

      // Separate blocked and unblocked violations
      const blockedViolations = data.filter((violation) => violation.status !== 'Unblocked')
      const unblockedViolations = data.filter((violation) => violation.status === 'Unblocked')

      // Fetch details for guards and students
      const guardIds = [...new Set(data.map((violation) => violation.recorded_by))]
      const studentIds = [...new Set(data.map((violation) => violation.student_id))]

      const guardsMap = {} // Initialize guards map
      const studentsMap = {} // Initialize students map

      // Fetch guard details
      for (const guardId of guardIds) {
        const guardUser = await getUserById(guardId)
        if (guardUser) {
          guardsMap[guardId] = guardUser // Store guard details in guardsMap
        }
      }

      // Fetch student details
      for (const studentId of studentIds) {
        const student = await getStudentByStudentId(studentId)
        if (student) {
          // Store full student details in studentsMap
          studentsMap[studentId] = {
            first_name: student.first_name,
            last_name: student.last_name,
            student_number: student.student_number
          }
        }
      }
      // Map blocked violations with guard names and student numbers
      studentRecords.value = blockedViolations.map((violation) => ({
        id: violation.id,
        violation_type: violation.violation_type,
        violation_date: violation.violation_date,
        status: violation.status,
        recorded_by: violation.recorded_by,
        studentId: violation.student_id,
        guardFullName: guardsMap[violation.recorded_by]
          ? `${guardsMap[violation.recorded_by].first_name || 'Unknown'} ${guardsMap[violation.recorded_by].last_name || ''}`
          : 'Unknown Guard',
        student_id: studentsMap[violation.student_id] || 'Unknown'
      }))

      // Set unblocked violations as history records
      history.value = unblockedViolations.map((violation) => ({
        id: violation.id,
        violation_type: violation.violation_type,
        violation_date: violation.violation_date,
        status: violation.status,
        recorded_by: violation.recorded_by,
        studentId: violation.student_id,
        guardFullName: guardsMap[violation.recorded_by]
          ? `${guardsMap[violation.recorded_by].first_name || 'Unknown'} ${guardsMap[violation.recorded_by].last_name || ''}`
          : 'Unknown Guard',
        studentFullName: studentsMap[violation.student_id]
          ? `${studentsMap[violation.student_id].first_name || 'Unknown'} ${studentsMap[violation.student_id].last_name || ''}`
          : 'Unknown Student'
      }))
    } catch (error) {
      console.error('Error fetching student violations:', error)
      noRecordMessage.value = 'Error fetching records: ' + (error.message || 'Unknown error')
    } finally {
      loading.value = false
    }
  }

  async function handleEnterClick() {
    if (!studentID.value) {
      noRecordMessage.value = 'Please enter a student ID'
      return
    }

    if (!/^\d+(-\d+)*$/.test(studentID.value)) {
      noRecordMessage.value = 'Please enter a valid student ID (numbers and dashes allowed)'
      return
    }

    // Fetch student details and set selectedStudent
    const student = await getStudentByStudentId(studentID.value)
    if (student) {
      selectedStudent.value = {
        fullName: `${student.first_name} ${student.last_name}`,
        student_number: student.student_number
      }
    } else {
      selectedStudent.value = {
        fullName: 'Unknown Student'
      }
    }

    await fetchViolations() // Fetch violations for the entered student ID
  }

  function showHistory() {
    selectedStudent.value = {
      fullName: history.value[0]?.studentFullName || 'Unknown Student',
      records: history.value // Set unblocked violations as the history records
    }
    historyModalVisible.value = true // Open the modal
  }

  // Function to close the history modal
  const closeModal = () => {
    historyModalVisible.value = false
  }

  // Watch for changes to studentID and reset records if empty
  watch(studentID, (newVal) => {
    if (!newVal) {
      studentRecords.value = []
      noRecordMessage.value = ''
    }
  })

  // Keydown event listener for Enter key
  onMounted(() => {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        handleEnterClick() // Call the search function on Enter key press
      }
    })
  })

  const toggleViewHistory = () => {
    showHistory.value = !showHistory.value
  }

  return {
    studentID,
    studentRecords,
    noRecordMessage,
    historyModalVisible,
    selectedStudent,
    loading, // Expose loading state
    toggleViewHistory,
    handleEnterClick,
    showHistory,
    closeModal,
    history
  }
}
