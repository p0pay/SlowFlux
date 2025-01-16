'use client'

import { Button } from "@/components/ui/button"
import { FileDown } from 'lucide-react'
import { exportToPDF, exportToCSV } from "@/lib/export"
import type { AnalysisHistory } from "@/types/analysis"

export function ExportButtons({ analysis }: { analysis: AnalysisHistory }) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportToPDF(analysis)}
      >
        <FileDown className="mr-2 h-4 w-4" />
        Export PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportToCSV(analysis)}
      >
        <FileDown className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
    </div>
  )
}

