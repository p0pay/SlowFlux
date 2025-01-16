'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

export function FeedbackButtons({ analysisId }: { analysisId: number }) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)
  const [positiveFeedbackCount, setPositiveFeedbackCount] = useState(0)
  const [negativeFeedbackCount, setNegativeFeedbackCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch(`/api/feedback?analysisId=${analysisId}`)
        if (response.ok) {
          const data = await response.json()
          setFeedback(data.feedback)
          setPositiveFeedbackCount(data.positiveFeedbackCount)
          setNegativeFeedbackCount(data.negativeFeedbackCount)
        }
      } catch (error) {
        console.error('Failed to fetch feedback:', error)
      }
    }

    fetchFeedback()
  }, [analysisId])

  const handleFeedback = async (type: 'positive' | 'negative') => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysisId, type }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      const data = await response.json()
      setFeedback(type)
      setPositiveFeedbackCount(data.positiveFeedbackCount)
      setNegativeFeedbackCount(data.negativeFeedbackCount)

      toast({
        title: "Thank you!",
        description: "Your feedback has been recorded.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={feedback === 'positive' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleFeedback('positive')}
      >
        <ThumbsUp className={`mr-2 h-4 w-4 ${feedback === 'positive' ? 'text-white' : 'text-green-500'}`} />
        <span className={feedback === 'positive' ? 'text-white' : 'text-green-500'}>+{positiveFeedbackCount}</span>
      </Button>
      <Button
        variant={feedback === 'negative' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleFeedback('negative')}
      >
        <ThumbsDown className={`mr-2 h-4 w-4 ${feedback === 'negative' ? 'text-white' : 'text-red-500'}`} />
        <span className={feedback === 'negative' ? 'text-white' : 'text-red-500'}>-{negativeFeedbackCount}</span>
      </Button>
    </div>
  )
}

