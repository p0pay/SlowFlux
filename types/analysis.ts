export interface AnalysisMetrics {
  aRecords: number
  ttlValue: number
  nsRecords: number
  domainLength: number
}

export interface AnalysisResult {
  prediction: 'active' | 'benign'
  metrics: AnalysisMetrics
}

export interface AnalysisHistory {
  id: number
  domain: string
  dig_output: string
  result: 'active' | 'benign'
  a_records: number
  ttl_value: number
  ns_records: number
  domain_length: number
  created_at: string
}

