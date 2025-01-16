import { NextResponse } from 'next/server'
import { initializeDb } from '@/lib/db'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(req: Request) {
  try {
    const { analysisId, type } = await req.json()
    
    if (!analysisId || !type) {
      return NextResponse.json(
        { error: 'Analysis ID and feedback type are required' },
        { status: 400 }
      )
    }

    // Get the authentication token from cookies
    const authToken = cookies().get('auth-token')
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the token and extract the user ID
    const { id: userId } = verify(authToken.value, JWT_SECRET) as { id: number }

    // Store the feedback in the database
    const db = await initializeDb()
    await db.run(
      `INSERT OR REPLACE INTO feedback (user_id, analysis_id, type) VALUES (?, ?, ?)`,
      [userId, analysisId, type]
    )

    // Get updated counts
    const positiveFeedbackCount = await db.get(
      'SELECT COUNT(*) as count FROM feedback WHERE analysis_id = ? AND type = ?',
      [analysisId, 'positive']
    )
    const negativeFeedbackCount = await db.get(
      'SELECT COUNT(*) as count FROM feedback WHERE analysis_id = ? AND type = ?',
      [analysisId, 'negative']
    )

    return NextResponse.json({ 
      success: true, 
      positiveFeedbackCount: positiveFeedbackCount.count, 
      negativeFeedbackCount: negativeFeedbackCount.count 
    })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const analysisId = url.searchParams.get('analysisId')

  if (!analysisId) {
    return NextResponse.json(
      { error: 'Analysis ID is required' },
      { status: 400 }
    )
  }

  // Get the authentication token from cookies
  const authToken = cookies().get('auth-token')
  if (!authToken) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
      )
  }

  // Verify the token and extract the user ID
  const { id: userId } = verify(authToken.value, JWT_SECRET) as { id: number }

  // Fetch the feedback from the database
  const db = await initializeDb()
  const feedback = await db.get(
    'SELECT type FROM feedback WHERE user_id = ? AND analysis_id = ?',
    [userId, analysisId]
  )

  const positiveFeedbackCount = await db.get(
    'SELECT COUNT(*) as count FROM feedback WHERE analysis_id = ? AND type = ?',
    [analysisId, 'positive']
  )
  const negativeFeedbackCount = await db.get(
    'SELECT COUNT(*) as count FROM feedback WHERE analysis_id = ? AND type = ?',
    [analysisId, 'negative']
  )

  return NextResponse.json({ 
    feedback: feedback ? feedback.type : null,
    positiveFeedbackCount: positiveFeedbackCount.count,
    negativeFeedbackCount: negativeFeedbackCount.count
  })
}

