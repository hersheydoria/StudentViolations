/* global process */
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config' // Load environment variables from .env file

// Initialize Supabase client
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

export const guardsInfo = async () => {
  const guards = [
    {
      id_number: '123-456',
      email: 'hershey.doria@carsu.edu.ph',
      password: 'hershey',
      first_name: 'John',
      last_name: 'Doe',
      role: 'Guard'
    },
    {
      id_number: '234-567',
      email: 'may.estroga@carsu.edu.ph',
      password: 'estroga',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'Guard'
    },
    {
      id_number: '345-678',
      email: 'rovannah.delola@carsu.edu.ph',
      password: 'rovannah',
      first_name: 'Alice',
      last_name: 'Johnson',
      role: 'Guard'
    }
  ]

  for (const guard of guards) {
    try {
      // Step 1: Create user in Supabase Auth with custom metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: guard.email,
        password: guard.password,
        options: {
          data: {
            id_number: guard.id_number,
            first_name: guard.first_name,
            last_name: guard.last_name,
            role: guard.role,
            aud: 'authenticated' // Sets the audience/role as authenticated
          }
        }
      })

      if (authError) {
        console.error(`Error creating new user for ${guard.email}:`, authError)
        continue
      }

      console.log(`New user created: ${guard.email} (ID: ${authData.user?.id})`)
    } catch (error) {
      console.error('Unexpected error:', error)
    }
  }
}

// Run the function to check for issues
guardsInfo()
