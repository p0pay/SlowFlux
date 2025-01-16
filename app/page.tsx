'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const [digOutput, setDigOutput] = useState('')
  const [domain, setDomain] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleAnalyze = async () => {
    if (!digOutput.trim() && !domain.trim()) {
      toast({
        title: "Error",
        description: "Please enter either a domain or dig output to analyze",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ digOutput, domain }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      router.push(`/results?id=${result.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze domain. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const stripDomain = (input: string) => {
    const domainRegex = /^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i
    const match = input.match(domainRegex)
    return match ? match[1] : input
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">SlowFlux</h1>
          <p className="text-muted-foreground">
            Analyse domain records to detect potential fast flux domain through trained machine learning model
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Domain Analysis</CardTitle>
            <CardDescription>
              Enter a domain OR paste your dig lookup output below for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="domain" className="text-sm font-medium">Domain</label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => {
                  const strippedDomain = stripDomain(e.target.value)
                  setDomain(strippedDomain)
                  setDigOutput('')
                }}
                placeholder="example.com"
                disabled={!!digOutput}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="digOutput" className="text-sm font-medium">Dig output</label>
                <p className="text-sm text-muted-foreground">Recommended command:</p>
                <p className="text-sm text-muted-background font-mono">
                  dig A +noadditional +noquestion +nocomments +nocmd +nostats example.com NS +noadditional +noquestion +nocomments +nocmd +nostats example.com
                </p>
              <Textarea
              id="digOutput"
              value={digOutput}
              onChange={(e) => {
                setDigOutput(e.target.value)
                setDomain('')
              }}
              placeholder={`; <<>> DiG 9.3.2rc1 <<>> example.com
; (1 server found)
;; global options:  printcmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 182
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 2, ADDITIONAL: 2

;; QUESTION SECTION:
;example.com.			IN	A

;; ANSWER SECTION:
example.com.		180	IN	A	1.1.1.1
example.com.		180	IN	A	2.2.2.2

;; AUTHORITY SECTION:
example.com.		180	IN	NS	ns1.example.com.
example.com.		180	IN	NS	ns2.example.com.

;; ADDITIONAL SECTION:
ns1.example.com.	153938	IN	A	3.3.3.3
ns2.example.com.	153938	IN	A	4.4.4.4

;; Query time: 687 msec
;; SERVER: 0.0.0.0
;; WHEN: Mon April 02 20:24:00 2024
;; MSG SIZE  rcvd: 325`}
              className="min-h-[300px] font-mono text-sm"
              disabled={!!domain}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDigOutput('')
                  setDomain('')
                }}
                disabled={isAnalyzing}
              >
                Clear
              </Button>
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Submit'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

