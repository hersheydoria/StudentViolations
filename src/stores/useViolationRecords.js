import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { supabase, SUPABASE_URL, SUPABASE_KEY } from './supabase'

export function useViolationRecords() {
  const router = useRouter()

  // Reactive variables
  const showForm = ref(false)
  const showLeftSidebar = ref(false)
  const showViewHistory = ref(false)
  const valid = ref(false)
  const selectedMethod = ref('idNumber')
  const showQrScanner = ref(false)
  const showStudentInfoModal = ref(false)
  const selectedStudent = ref({})
  const students = ref([])
  const violations = ref([])
  const history = ref([])
  const user = ref(null)
  const loading = ref(false)
  const searchQuery = ref('') // Must be initialized as a string
  const showUnblockModal = ref(false) // Unblock modal state
  const selectedViolation = ref(null) // To hold the currently selected violation for unblocking
  const filteredBlockedViolations = ref([]) // Holds filtered results
  const selectedStudentId = ref('') // Holds the selected student ID

  const headers = [
    { text: 'Student ID', value: 'student_id' },
    { text: 'Violation Type', value: 'violation_type' },
    { text: 'Date', value: 'violation_date' },
    { text: 'Recorded By', value: 'guard_name' },
    { text: 'Status', value: 'status' },
    { text: 'Action', value: 'action', sortable: false }
  ]

  const violationTypes = [
    'Abuse of University Code of Conduct',
    'Blatant disregard for the Code of Student Conduct',
    'Bribery or receiving a bribe',
    'Disruption or obstruction',
    'Dress code violation',
    'Gambling',
    'Hazing or abusive affiliation',
    'Disregard for flag ceremonies or acts dishonoring the University',
    'Not wearing ID',
    'Restricting student publication circulation',
    'Unauthorized use of CSU name or logo',
    'Violating university policies or agreements'
  ]

  // Add "Others" option dynamically
  const violationTypesWithOthers = computed(() => [...violationTypes, 'Others'])

  // New Violation
  const newViolation = ref({
    studentId: '',
    student_name: '',
    qrCode: '',
    type: '',
    otherType: '' // Holds the "Others" value
  })

  // Reactive state for showing the "Others" text field
  const showOtherViolationField = ref(false)

  const handleViolationTypeChange = () => {
    showOtherViolationField.value = newViolation.value.type === 'Others'
  }

  const fetchViolations = async () => {
    loading.value = true
    try {
      // Fetch all student violations
      const { data } = await axios.get(`${SUPABASE_URL}/rest/v1/student_violations`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        },
        params: {
          select: `
          id,
          violation_type,
          violation_date,
          status,
          recorded_by,
          student_id
        `
        }
      })

      // Separate blocked and unblocked violations
      const blockedViolations = data.filter((violation) => violation.status !== 'Unblocked')
      const unblockedViolations = data.filter((violation) => violation.status === 'Unblocked')

      const guardIds = [...new Set(data.map((violation) => violation.recorded_by))]
      const studentIds = [...new Set(data.map((violation) => violation.student_id))]

      const guardsMap = {}
      const studentsMap = {}

      // Fetch guard details
      for (const guardId of guardIds) {
        const guardUser = await getUserById(guardId)
        if (guardUser) {
          guardsMap[guardId] = guardUser
        }
      }

      // Fetch student details, including names
      for (const studentId of studentIds) {
        const student = await getStudentByStudentId(studentId)
        if (student) {
          studentsMap[studentId] = {
            student_number: student.student_number,
            full_name: `${student.first_name || 'Unknown'} ${student.last_name || ''}`
          }
        }
      }

      // Map blocked violations with guard names and student details
      violations.value = blockedViolations.map((violation) => ({
        id: violation.id,
        violation_type: violation.violation_type,
        violation_date: violation.violation_date,
        status: violation.status,
        recorded_by: violation.recorded_by,
        studentId: violation.student_id,
        guardFullName: guardsMap[violation.recorded_by]
          ? `${guardsMap[violation.recorded_by].first_name || 'Unknown'} ${guardsMap[violation.recorded_by].last_name || ''}`
          : 'Unknown Guard',
        student_id: studentsMap[violation.student_id]?.student_number || 'Unknown',
        student_name: studentsMap[violation.student_id]?.full_name || 'Unknown Student'
      }))

      // Map unblocked violations directly to the history
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
        student_id: studentsMap[violation.student_id]?.student_number || 'Unknown',
        student_name: studentsMap[violation.student_id]?.full_name || 'Unknown Student'
      }))
    } catch (error) {
      console.error('Error fetching student violations:', error)
    } finally {
      loading.value = false
    }
  }

  const getStudentByStudentId = async (studentId) => {
    const { data, error } = await supabase
      .from('students') // Ensure this matches your students table name
      .select('student_number')
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

  const fetchStudents = async () => {
    loading.value = true
    try {
      const { data } = await axios.get(`${SUPABASE_URL}/rest/v1/students`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      })

      students.value = data.map((student) => ({
        id: student.id,
        fullname: `${student.first_name} ${student.last_name}`,
        student_number: student.student_number,
        createdAt: student.created_at,
        address: student.address,
        birthday: student.birthday,
        image: student.image,
        program: student.program,
        year: student.year
      }))
    } catch (error) {
      console.error('Error fetching students:', error)
      alert('Failed to fetch students. Please try again.')
    } finally {
      loading.value = false
    }
  }
  const normalizeId = (id) => id?.replace(/-/g, '').trim() || ''

  const showStudentDetails = (studentId) => {
    // Normalize the incoming studentId
    const normalizedId = normalizeId(studentId)

    // Find student by normalized student number
    const student = students.value.find((s) => normalizeId(s.student_number) === normalizedId)

    if (student) {
      selectedStudent.value = student
      showStudentInfoModal.value = true
    } else {
      console.warn('Student not found for ID:', normalizedId)
      alert(`Student with ID ${normalizedId} not found.`)
    }
  }

  // Getting User Information Functionality
  const getUser = async () => {
    const {
      data: {
        user: { user_metadata: metadata }
      }
    } = await supabase.auth.getUser()

    if (metadata) {
      user.value = {
        id: metadata.sub, // User UUID
        email: metadata.email,
        fullname: `${metadata.first_name} ${metadata.last_name}`,
        idNumber: metadata.id_number,
        role: metadata.role
      }
    }
  }

  // Fetch students and user data on component mount
  onMounted(() => {
    fetchStudents()
    fetchViolations() // Ensure violations are fetched on component mount
    getUser()
  })

  const addViolation = async () => {
    await getUser() // Ensure user data is fetched before proceeding

    let studentInfo // Declare studentInfo to hold the student ID

    // Determine the student information based on the selected method
    if (selectedMethod.value === 'idNumber') {
      studentInfo = newViolation.value.studentId // Student ID directly
    } else if (selectedMethod.value === 'name') {
      const firstName = newViolation.value.firstName
      const lastName = newViolation.value.lastName

      // Fetch student by name to get the student ID
      const student = await getStudentByName(firstName, lastName)
      if (student) {
        studentInfo = student.student_number // Assuming student_number holds the ID
      } else {
        alert(`Student ${firstName} ${lastName} not found.`)
        return // Exit if the student is not found
      }
    } else {
      studentInfo = newViolation.value.studentId // For QR code, it uses student_id
    }

    // Check for required information
    if (!studentInfo || !newViolation.value.type) {
      alert('Please provide both Student Info and Violation Type.')
      return
    }

    // Handle custom violation type for "Others"
    const violationType =
      newViolation.value.type === 'Others' ? newViolation.value.otherType : newViolation.value.type

    if (!violationType) {
      alert('Please specify the violation type for "Others".')
      return
    }

    // Validate if the student_number exists in Supabase
    try {
      console.log('Validating student number:', studentInfo)

      const { data: studentData, error: fetchError } = await axios.get(
        `${SUPABASE_URL}/rest/v1/students`,
        {
          params: {
            student_number: `eq.${studentInfo}`, // Use "eq" filter for student_number
            select: 'student_number' // Select only the student_number field
          },
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`
          }
        }
      )

      console.log('Supabase Response:', { studentData, fetchError })

      if (fetchError) {
        console.error('Fetch Error:', fetchError)
        alert(`Error fetching student data: ${fetchError.message}`)
        return
      }

      if (!studentData || studentData.length === 0) {
        alert(`Student Number ${studentInfo} not found in the system.`)
        return // Exit if student number does not exist
      }
    } catch (err) {
      console.error('Error validating student number:', err.response?.data || err.message)
      alert('Failed to validate the student number. Please try again later.')
      return
    }

    const guardId = user.value?.id || 'Unknown' // Use the UUID from auth.users
    if (!guardId || guardId === 'Unknown') {
      alert('No user is currently signed in.')
      return
    }

    const newViolationRecord = {
      id: uuidv4(),
      student_id: studentInfo,
      violation_type: violationType, // Use the resolved violation type
      violation_date: new Date().toLocaleString(), // Get local date and time string
      recorded_by: guardId, // UUID from auth.users
      status: 'Blocked'
    }

    try {
      const { data, error } = await axios.post(
        `${SUPABASE_URL}/rest/v1/student_violations`,
        newViolationRecord,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          }
        }
      )

      if (error) {
        console.error('Supabase Error Details:', error.response?.data)
        alert('Failed to save the violation. Please try again.')
        return
      }

      violations.value.push(data[0])
      resetForm()
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message)
      alert('Failed to save the violation: ' + (err.response?.data.message || err.message))
    }
  }

  // Function to get a student by first name and last name
  const getStudentByName = async (firstName, lastName) => {
    const { data, error } = await supabase
      .from('students')
      .select('student_number')
      .eq('first_name', firstName)
      .eq('last_name', lastName)
      .single() // Get a single record

    if (error) {
      console.error(`Error fetching student data for ${firstName} ${lastName}`, error)
      return null
    }

    return data // Should return the student record including student_number
  }

  // Reset form state
  const resetForm = () => {
    newViolation.value = {
      studentId: '',
      student_name: '',
      qrCode: '',
      type: '',
      otherType: ''
    }
    showOtherViolationField.value = false
    showForm.value = false
  }

  const unblockViolation = async (violationId) => {
    // Find the index of the violation in the local array
    const index = violations.value.findIndex((v) => v.id === violationId)
    if (index === -1) {
      console.warn(`Violation with ID ${violationId} not found in local data.`)
      return
    }

    // Locally update the status in the `violations` array
    const unblockedViolation = { ...violations.value[index], status: 'Unblocked' }

    try {
      // Send a PATCH request to Supabase to update the status
      const { error } = await axios.patch(
        `${SUPABASE_URL}/rest/v1/student_violations?id=eq.${violationId}`,
        { status: 'Unblocked' },
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          }
        }
      )

      if (error) {
        console.error('Failed to update violation in Supabase:', error.message)
        alert('Failed to unblock the violation. Please try again.')
        return
      }

      // Remove the unblocked violation from filteredBlockedViolations
      filteredBlockedViolations.value = filteredBlockedViolations.value.filter(
        (violation) => violation.id !== violationId
      )

      // Move the unblocked violation from `violations` to `history` in local state
      history.value.push(unblockedViolation)
      violations.value.splice(index, 1)
    } catch (err) {
      console.error('Unexpected error while unblocking violation:', err.message)
      alert('An unexpected error occurred while unblocking the violation.')
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('authUser')
      user.value = null
      router.push('/login')
      alert('You have successfully logged out.')
    } catch (error) {
      console.error('Error during logout:', error)
      alert('Failed to log out. Please try again.')
    }
  }

  const toggleViewHistory = () => {
    showViewHistory.value = !showViewHistory.value
  }

  const toggleLeftSidebar = () => {
    showLeftSidebar.value = !showLeftSidebar.value
  }

  const findStudentByName = () => {
    const query = newViolation.value.student_name.toLowerCase()

    // Check if the student name exists in the list of students
    const student = students.value.find((student) => student.fullname.toLowerCase() === query)

    if (student) {
      newViolation.value.studentId = normalizeId(student.student_number)
    } else {
      console.error('Student not found')
    }
  }

  const onNameInput = () => {
    findStudentByName()
  }

  const onQrCodeScanned = (result) => {
    if (result) {
      newViolation.value.studentId = result
      showQrScanner.value = false
    }
  }

  const onError = (error) => {
    console.error('QR Code Scan Error:', error)
    alert('Failed to scan QR code. Please try again.')
  }

  // In your useViolationRecords.js
  const removeViolation = async (id) => {
    const { data, error } = await supabase.from('student_violations').delete().eq('id', id)

    if (error) throw error
    return data
  }

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true // Use 12-hour format
    }
    return date.toLocaleString('en-US', options)
  }

  // Unblock all violations for the selected student
  const onUnblockAll = async () => {
    if (!selectedStudentId.value) {
      alert('Please search for a valid student ID!')
      return
    }

    const studentId = selectedStudentId.value

    // Filter violations for the given student ID
    const violationsToUnblock = filteredBlockedViolations.value.filter(
      (violation) => violation.student_id === studentId
    )

    if (!violationsToUnblock.length) {
      alert(`No violations found for student ID: ${studentId}`)
      return
    }

    try {
      for (const violation of violationsToUnblock) {
        await unblockViolation(violation.id)
      }

      alert(`All violations for student ${studentId} have been unblocked.`)
      fetchViolations() // Refresh the list after unblocking
      showUnblockModal.value = false // Close the modal
    } catch (error) {
      console.error('Failed to unblock all violations:', error)
      alert('An error occurred while unblocking violations.')
    }
  }

  // Method to perform the search
  const searchViolations = () => {
    const query = searchQuery.value.trim().toLowerCase()
    selectedStudentId.value = query

    if (!query) {
      filteredBlockedViolations.value = violations.value // Show all results if query is empty
      return
    }

    filteredBlockedViolations.value = violations.value.filter((violation) => {
      const studentId = violation.student_id ? violation.student_id.toLowerCase() : ''

      // Return true if the student ID matches the query
      return studentId.includes(query)
    })
  }

  const closeUnblockModal = () => {
    selectedViolation.value = null // Clear the selected violation
    showUnblockModal.value = false // Close the modal
    searchQuery.value = '' // Clear the search query inside the modal
    filteredBlockedViolations.value = [] // Clear the filtered list shown in the modal
  }

  return {
    showForm,
    showLeftSidebar,
    showViewHistory,
    valid,
    selectedMethod,
    showQrScanner,
    showStudentInfoModal,
    selectedStudent,
    newViolation,
    violations,
    history,
    headers,
    violationTypes,
    user,
    formatDate,
    addViolation,
    resetForm,
    unblockViolation,
    logout,
    toggleViewHistory,
    toggleLeftSidebar,
    findStudentByName,
    onNameInput,
    showStudentDetails,
    onQrCodeScanned,
    onError,
    fetchViolations,
    removeViolation,
    showUnblockModal,
    selectedViolation,
    closeUnblockModal,
    searchQuery,
    filteredBlockedViolations,
    searchViolations,
    onUnblockAll,
    showOtherViolationField,
    handleViolationTypeChange,
    violationTypesWithOthers
  }
}
