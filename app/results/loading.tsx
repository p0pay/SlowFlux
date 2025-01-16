import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-10">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-5 w-64" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-5 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border bg-card p-4">
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-12 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

