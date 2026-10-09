export type SyncState = 'pending' | 'syncing' | 'synced' | 'failed'

export interface GradingRecord {
  id: string
  sessionId: string
  timestamp: number
  time: string
  grader: string
  sample: string
  fish: string
  weight: string
  grade: string
  status: string
  capturedImage?: string
  capturedImageId?: string
  remoteImagePath?: string
  result?: { status: string; originalGrade: string | null; originalConfidence: number | null; rawConfidence?: number; overrideGrade: string | null; overrideReason: string; overrideActor?: string; overrideAt?: string; inferenceId?: string; captureId?: string; scores?: Record<string, number>; imageType?: 'sashibocore' | 'tailcut'; modelSource?: 'raspberry-pi' | 'demo' }
  transaction?: { currency: string; amount: number | null; syncState: SyncState; lastSyncError?: string }
}

export const RECORDS_KEY = 'tunaeye-records'

export const loadRecords = (): GradingRecord[] => {
  try { return JSON.parse(localStorage.getItem(RECORDS_KEY) ?? '[]') as GradingRecord[] }
  catch { return [] }
}

export function saveRecords(records: GradingRecord[]) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
  window.dispatchEvent(new Event('tunaeye-records-updated'))
}

export function updateRecord(id: string, update: Partial<GradingRecord>) {
  saveRecords(loadRecords().map(record => record.id === id ? { ...record, ...update } : record))
}
