import { initializeDb } from '@/lib/db'
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { redirect } from 'next/navigation'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export default async function HistoryPage() {
  const authToken = cookies().get('auth-token')
  if (!authToken) {
    redirect('/login')
  }

  const { id: userId } = verify(authToken.value, JWT_SECRET) as { id: number }
  
  const db = await initializeDb()
  const history = await db.all(
    `SELECT ah.*, 
     (SELECT COUNT(*) FROM feedback WHERE analysis_id = ah.id AND type = 'positive') as positive_feedback,
     (SELECT COUNT(*) FROM feedback WHERE analysis_id = ah.id AND type = 'negative') as negative_feedback
     FROM analysis_history ah
     WHERE ah.user_id = ? 
     ORDER BY ah.created_at DESC 
     LIMIT 50`,
    userId
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="mb-8 space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">SlowFlux History</h1>
            <Link href="/">
              <Button>New Analysis</Button>
            </Link>
          </div>
          <p className="text-muted-foreground">
            Recent domain analyses and their results
          </p>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>A Records</TableHead>
                <TableHead>TTL</TableHead>
                <TableHead>NS Records</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.domain}</TableCell>
                  <TableCell>
                    <Badge variant={record.result === 'active' ? "destructive" : "default"}>
                      {record.result}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.a_records}</TableCell>
                  <TableCell>{record.ttl_value}</TableCell>
                  <TableCell>{record.ns_records}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(record.created_at), 'yyyy-MM-dd HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <span className="text-green-500">+{record.positive_feedback}</span>
                    {' / '}
                    <span className="text-red-500">-{record.negative_feedback}</span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/results?id=${record.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

