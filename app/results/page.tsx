import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Shield, ShieldAlert, ThumbsUp, ThumbsDown } from 'lucide-react'
import Link from "next/link"
import { initializeDb } from "@/lib/db"
import { notFound } from "next/navigation"
import type { AnalysisHistory } from "@/types/analysis"
import { ExportButtons } from './export-buttons'
import { FeedbackButtons } from './feedback-buttons'

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  if (!searchParams.id) {
    notFound()
  }

  const db = await initializeDb()
  const result = await db.get<AnalysisHistory>(
    'SELECT * FROM analysis_history WHERE id = ?', 
    searchParams.id
  )

  if (!result) {
    notFound()
  }

  const isActive = result.result === 'active'

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">SlowFlux Results</h1>
            <Badge variant={isActive ? "destructive" : "default"}>
              {isActive ? "active" : "benign"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Analysis completed for <span className={isActive ? "text-red-500" : "text-green-500"}>{result.domain}</span>
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isActive ? (
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                ) : (
                  <Shield className="h-5 w-5 text-green-500" />
                )}
                Domain Status
              </CardTitle>
              <CardDescription>
                {isActive
                  ? "This domain shows characteristics of single flux"
                  : "This domain appears to not be fluxing"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border bg-card p-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Key Indicators</h4>
                    <p className="text-sm text-muted-foreground">
                      Analysis of domain characteristics
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 items-center gap-4">
                      <div className="font-medium">A Records</div>
                      <div className="text-right">{result.a_records}</div>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                      <div className="font-medium">Min TTL Value</div>
                      <div className="text-right">{result.ttl_value}</div>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                      <div className="font-medium">NS Records</div>
                      <div className="text-right">{result.ns_records}</div>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                      <div className="font-medium">Domain Length</div>
                      <div className="text-right">{result.domain_length}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">
                      Recommendation
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {isActive
                        ? "Carefully investigate the domain to confirm its classification as malicious or benign. Review its associated IP addresses and behaviors, and cross-check with threat intelligence databases. Proceed cautiously, as false positives are possible."
                        : "Conduct further investigation to validate the domain’s status and remain cautious. Regularly monitor its activity for any signs of abnormal behavior to ensure continued safety."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <FeedbackButtons analysisId={result.id} />
                <ExportButtons analysis={result} />
              </div>

              <div className="flex justify-end space-x-2">
                <Link href="/">
                  <Button variant="outline">Analyse Another Domain</Button>
                </Link>
                <Link href="/history">
                  <Button>View History</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

