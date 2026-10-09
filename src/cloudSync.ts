import { getCapturedEvidence, markEvidenceSynced, updateEvidenceSyncState } from './evidenceStorage'
import { loadRecords, saveRecords, type GradingRecord } from './gradingRecords'
import { ensureSupabaseUser, getSupabase, isSupabaseConfigured } from './supabase'

const BUCKET = 'grading-images'
const sampleType = (sample: string) => sample === 'Tail cut' ? 'tail_cut' as const : 'sashibo_core' as const
const grade = (record: GradingRecord) => ['A', 'B', 'C'].includes(record.grade) ? record.grade as 'A' | 'B' | 'C' : 'Invalid'
const imageExtension = (mimeType: string) => ({ 'image/png': 'png', 'image/webp': 'webp' }[mimeType] ?? 'jpg')

function setSyncState(id: string, syncState: 'syncing' | 'synced' | 'failed', lastSyncError?: string, remoteImagePath?: string) {
  saveRecords(loadRecords().map(record => record.id === id ? {
    ...record,
    remoteImagePath: remoteImagePath ?? record.remoteImagePath,
    transaction: { currency: record.transaction?.currency ?? 'PHP', amount: record.transaction?.amount ?? null, syncState, lastSyncError },
  } : record))
}

export interface SyncSummary { synced: number; failed: number; skipped: number }

let activeSync: Promise<SyncSummary> | null = null

async function runPendingSync(): Promise<SyncSummary> {
  if (!isSupabaseConfigured()) throw new Error('Supabase is not configured. Add the Vite environment variables first.')
  if (!navigator.onLine) throw new Error('No internet connection. Records remain pending.')
  const supabase = getSupabase()
  const user = await ensureSupabaseUser()
  const pending = loadRecords().filter(record => record.transaction?.syncState !== 'synced')
  const summary: SyncSummary = { synced: 0, failed: 0, skipped: 0 }

  for (const record of pending) {
    setSyncState(record.id, 'syncing')
    try {
      const evidence = record.capturedImageId ? await getCapturedEvidence(record.capturedImageId) : undefined
      if (record.capturedImageId && !evidence) throw new Error('Captured evidence is missing. The record remains pending.')
      let imagePath = record.remoteImagePath ?? evidence?.remotePath ?? null
      if (evidence && !imagePath) {
        imagePath = `${user.id}/${record.id}/${sampleType(record.sample)}.${imageExtension(evidence.mimeType)}`
        await updateEvidenceSyncState(evidence.id, 'syncing')
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(imagePath, evidence.blob, { contentType: evidence.mimeType, upsert: true })
        if (uploadError) throw uploadError
      }

      const { error } = await supabase.from('grading_records').upsert({
        id: record.id,
        user_id: user.id,
        source: 'kiosk',
        station_id: localStorage.getItem('tunaeye-station') ?? 'TunaEye Station 01',
        session_id: record.sessionId,
        grader_name: record.grader,
        sample_type: sampleType(record.sample),
        fish_id: record.fish,
        weight_kg: Number.parseFloat(record.weight) || null,
        grade: grade(record),
        confidence: record.result?.originalConfidence ?? null,
        result_status: record.result?.status ?? record.status,
        original_grade: record.result?.originalGrade as 'A' | 'B' | 'C' | null | undefined,
        override_grade: record.result?.overrideGrade as 'A' | 'B' | 'C' | null | undefined,
        override_reason: record.result?.overrideReason || null,
        image_path: imagePath,
        captured_at: new Date(evidence?.capturedAt ?? record.timestamp).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      if (error) throw error

      const { data: verified, error: verifyError } = await supabase.from('grading_records').select('id').eq('id', record.id).single()
      if (verifyError || !verified) throw verifyError ?? new Error('Cloud persistence could not be verified.')
      if (evidence && imagePath) await markEvidenceSynced(evidence.id, imagePath)
      setSyncState(record.id, 'synced', undefined, imagePath ?? undefined)
      summary.synced += 1
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown synchronization error'
      if (record.capturedImageId) await updateEvidenceSyncState(record.capturedImageId, 'failed').catch(() => undefined)
      setSyncState(record.id, 'failed', message)
      summary.failed += 1
    }
  }
  return summary
}

export function syncPendingRecords(): Promise<SyncSummary> {
  activeSync ??= runPendingSync().finally(() => { activeSync = null })
  return activeSync
}

export async function fetchCloudRecords(): Promise<GradingRecord[]> {
  if (!isSupabaseConfigured() || !navigator.onLine) return []
  await ensureSupabaseUser()
  const { data, error } = await getSupabase().from('grading_records').select('*').order('captured_at', { ascending: false }).limit(200)
  if (error) throw error
  return data.map(row => ({
    id: row.id, sessionId: row.session_id, timestamp: Date.parse(row.captured_at), time: new Date(row.captured_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    grader: row.grader_name, sample: row.sample_type === 'tail_cut' ? 'Tail cut' : 'Sashibo core', fish: row.fish_id,
    weight: row.weight_kg === null ? '—' : `${row.weight_kg} kg`, grade: row.grade, status: row.override_grade ? 'Override' : row.result_status,
    remoteImagePath: row.image_path ?? undefined,
    result: { status: row.result_status, originalGrade: row.original_grade, originalConfidence: row.confidence, overrideGrade: row.override_grade, overrideReason: row.override_reason ?? '' },
    transaction: { currency: 'PHP', amount: null, syncState: 'synced' },
  }))
}
