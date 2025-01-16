import { NextResponse } from 'next/server'
import { createUser } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    
    const success = await createUser(username, password)
    if (!success) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}

