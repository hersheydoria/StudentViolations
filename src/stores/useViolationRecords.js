import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { watch } from 'vue'

export function useViolationRecords() {
  const router = useRouter()

  // Reactive variables
  const showForm = ref(false)
  const showLeftSidebar = ref(false)
  const showViewHistory = ref(false)
  const valid = ref(false)
  const selectedMethod = ref('idNumber')
  const showQrScanner = ref(false)

  // State for controlling the student info modal
  const showStudentInfoModal = ref(false)
  const selectedStudent = ref({})

  // Predefined student details (replace with API call if needed)
  const students = [
    {
      id: '221-00414',
      name: 'John Doe',
      picture: 'hershey.jpeg',
      address: '1234 Elm Street',
      birthday: '2000-01-01',
      programYear: 'BS Computer Science, 3rd Year'
    }
    // Add more student objects as needed
  ]

  // Violation form data
  const newViolation = ref({
    studentId: '',
    studentName: '',
    qrCode: '',
    type: ''
  })
  watch(
    () => newViolation.value.studentId,
    (newValue) => {
      console.log('New Student ID:', newValue) // Log to see if it changes
    }
  )

  const violations = ref([]) // Current violation data
  const history = ref([]) // History of violations
  const headers = [
    { text: 'Student ID', value: 'studentId' },
    { text: 'Violation Type', value: 'type' },
    { text: 'Date', value: 'date' },
    { text: 'Recorded By', value: 'recordedBy' },
    { text: 'Status', value: 'status' },
    { text: 'Action', value: 'action', sortable: false }
  ]

  // Alphabetically sorted violation types
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

  // Methods
  const addViolation = () => {
    const studentInfo =
      selectedMethod.value === 'idNumber'
        ? newViolation.value.studentId
        : selectedMethod.value === 'name'
          ? newViolation.value.studentName
          : newViolation.value.studentId

    if (!studentInfo || !newViolation.value.type) {
      alert('Please provide both Student Info and Violation Type.')
      return
    }

    violations.value.push({
      id: violations.value.length + 1,
      studentId: studentInfo,
      type: newViolation.value.type,
      date: new Date().toLocaleDateString(),
      recordedBy: 'Guard',
      status: 'Blocked'
    })

    resetForm()
  }

  const resetForm = () => {
    newViolation.value.studentId = ''
    newViolation.value.studentName = ''
    newViolation.value.qrCode = ''
    newViolation.value.type = ''
    showForm.value = false
  }

  const unblockViolation = (violationId) => {
    const index = violations.value.findIndex((v) => v.id === violationId)
    if (index !== -1) {
      const unblockedViolation = violations.value[index]
      unblockedViolation.status = 'Unblocked'
      history.value.push(unblockedViolation)
      violations.value.splice(index, 1)
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    router.push('/login')
  }

  const toggleViewHistory = () => {
    showViewHistory.value = !showViewHistory.value
  }

  const toggleLeftSidebar = () => {
    showLeftSidebar.value = !showLeftSidebar.value
  }

  const normalizeId = (id) => id.replace(/-/g, '').trim()

  const findStudentByName = () => {
    const student = students.find((student) => student.name === newViolation.value.studentName)
    if (student) {
      newViolation.value.studentId = normalizeId(student.id)
    } else {
      console.error('Student not found')
    }
  }

  const onNameInput = () => {
    findStudentByName()
  }

  const showStudentDetails = (studentId) => {
    const student = students.find((s) => normalizeId(s.id) === normalizeId(studentId))
    if (student) {
      selectedStudent.value = student
      showStudentInfoModal.value = true
    }
  }

  // QR Code Scanning Logic
  const onQrCodeScanned = (result) => {
    if (result) {
      console.log('QR Code Scanned Result:', result)
      newViolation.value.studentId = result // Keep the hyphens
      console.log('New Student ID:', newViolation.value.studentId) // Should show 221-00414
      showQrScanner.value = false // Close the scanner
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
    onError
  }
}
