import { initializeDb } from '../lib/db'

async function main() {
  try {
    await initializeDb()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    process.exit(1)
  }
}

main()

