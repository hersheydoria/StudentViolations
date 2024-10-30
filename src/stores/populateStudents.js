import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from './supabase'

const apiURL = 'https://fakerapi.it/api/v2/persons?_quantity=10'

// Predefined student numbers and their corresponding images, programs, and years
const predefinedStudents = [
  {
    student_number: '221-00414',
    image: 'hershey.jpeg', // Replace with actual image URLs
    program: 'Bachelor of Science in Information Technology',
    year: 'Third Year'
  },
  {
    student_number: '221-00598',
    image: 'may.jpg', // Replace with actual image URLs
    program: 'Bachelor of Science in Civil Engineering',
    year: 'Second Year'
  },
  {
    student_number: '221-01275',
    image: 'rovannah.jpg', // Replace with actual image URLs
    program: 'Bachelor of Arts in Psychology',
    year: 'First Year'
  }
]

// Function to generate a random program for students
const generateRandomProgram = () => {
  const programs = [
    'Bachelor of Science in Information Technology',
    'Bachelor of Science in Civil Engineering',
    'Bachelor of Arts in Psychology',
    'Bachelor of Science in Agriculture',
    'Bachelor of Science in Information System'
  ]
  return programs[Math.floor(Math.random() * programs.length)]
}

// Function to generate a random student number
const generateRandomStudentNumber = () => {
  const year = 221
  const number = Math.floor(10000 + Math.random() * 90000)
  return `${year}-${number}` // Corrected the syntax for string interpolation
}

const generateRandomYear = () => {
  const years = ['First Year', 'Second Year', 'Third Year', 'Fourth Year']
  return years[Math.floor(Math.random() * years.length)]
}

async function populateStudents() {
  try {
    const response = await axios.get(apiURL)
    const data = response.data.data

    const studentsData = data.map((student, index) => {
      if (index < predefinedStudents.length) {
        // Use predefined student data for the first three students
        return {
          id: uuidv4(), // Generate a unique UUID for each student
          first_name: student.firstname,
          last_name: student.lastname,
          student_number: predefinedStudents[index].student_number,
          address: student.address.street,
          birthday: student.birthday,
          image: predefinedStudents[index].image,
          program: predefinedStudents[index].program,
          year: predefinedStudents[index].year
        }
      } else {
        // Generate random data for other students
        let randomStudentNumber = generateRandomStudentNumber()
        return {
          id: uuidv4(),
          first_name: student.firstname,
          last_name: student.lastname,
          student_number: randomStudentNumber,
          address: student.address.street,
          birthday: student.birthday,
          image: student.image || 'default_image.jpg', // Use a default image if none provided
          program: generateRandomProgram(),
          year: generateRandomYear()
        }
      }
    })

    // Upsert the students data into the database
    const { data: error } = await supabase
      .from('students')
      .upsert(studentsData, { onConflict: ['student_number'] })

    if (error) {
      console.error('Error upserting data:', error)
    }
  } catch (error) {
    console.error('Error fetching data from FakerAPI:', error)
  }
}

// Run the function
populateStudents()
