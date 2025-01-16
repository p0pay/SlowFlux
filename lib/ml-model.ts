import type { AnalysisResult } from '@/types/analysis'

const ML_SERVICE_URL = 'http://localhost:8000'

export class MLServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MLServiceError'
  }
}

export async function analyzeDomain(digOutput: string): Promise<AnalysisResult> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dig_output: digOutput }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new MLServiceError(error.detail || 'Analysis failed')
    }

    return response.json()
  } catch (error) {
    if (error instanceof MLServiceError) {
      throw error
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new MLServiceError('ML service is not available. Please ensure the Python service is running.')
    }
    
    throw new MLServiceError('An unexpected error occurred during analysis')
  }
}

