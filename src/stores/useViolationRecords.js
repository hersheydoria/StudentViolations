import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

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

  const headers = [
    { text: 'Student ID', value: 'studentId' },
    { text: 'Violation Type', value: 'type' },
    { text: 'Date', value: 'date' },
    { text: 'Recorded By', value: 'recordedBy' },
    { text: 'Status', value: 'status' },
    { text: 'Action', value: 'action', sortable: false }
  ]

  const violationTypes = [
    'Abuse Code Ceremony',
    'Blocking Publication',
    'Bribery Receiving Bribe',
    'Disregard Code Conduct',
    'Disruption Obstruction',
    'Dress Code',
    'Gambling',
    'Having Abusive Affiliation',
    'Ignoring Flag Ceremony',
    'Not Wearing ID',
    'Violating Policies'
  ]

  const newViolation = ref({
    studentId: '',
    studentName: '',
    qrCode: '',
    type: ''
  })
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

      // Fetch student details
      for (const studentId of studentIds) {
        const student = await getStudentByStudentId(studentId)
        if (student) {
          studentsMap[studentId] = student.student_number
        }
      }

      // Map blocked violations with guard names and student numbers
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
        student_id: studentsMap[violation.student_id] || 'Unknown'
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
        student_id: studentsMap[violation.student_id] || 'Unknown'
      }))

      console.log('Blocked violations:', violations.value)
      console.log('Unblocked violations (history):', history.value)
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
    console.log('Student ID passed to showStudentDetails:', studentId)

    // Normalize the incoming studentId
    const normalizedId = normalizeId(studentId)
    console.log('Normalized Student ID:', normalizedId)

    // Debug: log the normalized student IDs in students.value
    const studentIds = students.value.map((s) => normalizeId(s.student_number))
    console.log('Available Student IDs:', studentIds)

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

    const studentInfo =
      selectedMethod.value === 'idNumber'
        ? newViolation.value.studentId
        : newViolation.value.studentName

    if (!studentInfo || !newViolation.value.type) {
      alert('Please provide both Student Info and Violation Type.')
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
      violation_type: newViolation.value.type,
      violation_date: new Date().toISOString(),
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

  const resetForm = () => {
    newViolation.value.studentId = ''
    newViolation.value.studentName = ''
    newViolation.value.qrCode = ''
    newViolation.value.type = ''
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
      const { data, error } = await axios.patch(
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

      // Move the unblocked violation from `violations` to `history` in local state
      history.value.push(unblockedViolation)
      violations.value.splice(index, 1)
      console.log(`Violation with ID ${violationId} has been unblocked.`)
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
    const student = students.value.find(
      (student) => student.name === newViolation.value.studentName
    )
    if (student) {
      newViolation.value.studentId = normalizeId(student.id)
    } else {
      console.error('Student not found')
    }
  }

  const onNameInput = () => {
    findStudentByName()
  }

  const onQrCodeScanned = (result) => {
    if (result) {
      console.log('QR Code Scanned Result:', result)
      newViolation.value.studentId = result
      showQrScanner.value = false
    }
  }

  const onError = (error) => {
    console.error('QR Code Scan Error:', error)
    alert('Failed to scan QR code. Please try again.')
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
    fetchViolations
  }
}
