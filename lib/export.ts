import { jsPDF } from 'jspdf'
import { AnalysisHistory } from '@/types/analysis'

export function exportToPDF(analysis: AnalysisHistory) {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(20)
  doc.text('SlowFlux Analysis Report', 20, 20)
  
  // Add domain info
  doc.setFontSize(14)
  doc.text(`Domain: ${analysis.domain}`, 20, 40)
  doc.text(`Status: ${analysis.result}`, 20, 50)
  
  // Add metrics
  doc.setFontSize(12)
  doc.text('Metrics:', 20, 70)
  doc.text(`A Records: ${analysis.a_records}`, 30, 80)
  doc.text(`TTL Value: ${analysis.ttl_value}`, 30, 90)
  doc.text(`NS Records: ${analysis.ns_records}`, 30, 100)
  doc.text(`Domain Length: ${analysis.domain_length}`, 30, 110)
  
  // Add timestamp
  doc.setFontSize(10)
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    20,
    doc.internal.pageSize.height - 20
  )
  
  // Save the PDF
  doc.save(`slowflux-analysis-${analysis.domain}.pdf`)
}

export function exportToCSV(analysis: AnalysisHistory) {
  const headers = [
    'Domain',
    'Result',
    'A Records',
    'TTL Value',
    'NS Records',
    'Domain Length',
    'Analysis Date'
  ]
  
  const data = [
    analysis.domain,
    analysis.result,
    analysis.a_records,
    analysis.ttl_value,
    analysis.ns_records,
    analysis.domain_length,
    new Date(analysis.created_at).toLocaleString()
  ]
  
  const csvContent = [
    headers.join(','),
    data.join(',')
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `slowflux-analysis-${analysis.domain}.csv`
  link.click()
}

