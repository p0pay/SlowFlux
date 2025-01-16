import { NextResponse } from 'next/server'
import { analyzeDomain } from '@/lib/ml-model'
import { initializeDb } from '@/lib/db'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function getDigOutput(domain: string): Promise<string> {
  const { stdout: aRecords } = await execAsync(`dig A +noadditional +noquestion +nocomments +nocmd +nostats ${domain}`)
  const { stdout: nsRecords } = await execAsync(`dig NS +noadditional +noquestion +nocomments +nocmd +nostats ${domain}`)
  return aRecords + nsRecords
}

export async function POST(req: Request) {
  try {
    const { digOutput, domain } = await req.json()
    
    if (!digOutput && !domain) {
      return NextResponse.json(
        { error: 'Either dig output or domain is required' },
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

    // If domain is provided, get the dig output
    const finalDigOutput = domain ? await getDigOutput(domain) : digOutput

    // Analyze the domain using our ML model
    const result = await analyzeDomain(finalDigOutput)
    
    // Store the result in the database
    const db = await initializeDb()
    const dbResult = await db.run(
      `INSERT INTO analysis_history 
       (user_id, domain, dig_output, result, a_records, ttl_value, ns_records, domain_length) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        result.domain,
        finalDigOutput,
        result.prediction,
        result.metrics.aRecords,
        result.metrics.ttlValue,
        result.metrics.nsRecords,
        result.metrics.domainLength
      ]
    )

    return NextResponse.json({
      id: dbResult.lastID,
      ...result
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze domain' },
      { status: 500 }
    )
  }
}

