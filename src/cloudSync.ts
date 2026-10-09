import { deleteCapturedEvidence, getCapturedEvidence, markEvidenceSynced, updateEvidenceSyncState } from './evidenceStorage'
import { loadRecords, saveRecords, type GradingRecord } from './gradingRecords'
import { ensureSupabaseUser, getSupabase, isSupabaseConfigured, type Database } from './supabase'

const BUCKET = 'grading-images'
const sampleType = (sample: string) => sample === 'Tail cut' ? 'tail_cut' as const : 'sashibo_core' as const
const grade = (record: GradingRecord) => ['A', 'B', 'C'].includes(record.grade) ? record.grade as 'A' | 'B' | 'C' : 'Invalid'
const imageExtension = (mimeType: string) => ({ 'image/png': 'png', 'image/webp': 'webp' }[mimeType] ?? 'jpg')
const RETAIN_SYNCED_RECORDS = 200

function setSyncState(id: string, syncState: 'syncing' | 'synced' | 'failed', lastSyncError?: string, remoteImagePath?: string) {
  saveRecords(loadRecords().map(record => record.id === id ? {
    ...record,
    remoteImagePath: remoteImagePath ?? record.remoteImagePath,
    transaction: { currency: record.transaction?.currency ?? 'PHP', amount: record.transaction?.amount ?? null, syncState, lastSyncError },
  } : record))
}

export interface SyncSummary { synced: number; failed: number; skipped: number }

let activeSync: Promise<SyncSummary> | null = null

function sameValue(actual: unknown, expected: unknown) {
  return JSON.stringify(actual ?? null) === JSON.stringify(expected ?? null)
}

async function sameBlob(left: Blob, right: Blob) {
  if (left.size !== right.size) return false
  const [leftBytes, rightBytes] = await Promise.all([left.arrayBuffer(), right.arrayBuffer()])
  const rightView = new Uint8Array(rightBytes)
  return new Uint8Array(leftBytes).every((value, index) => value === rightView[index])
}

async function pruneVerifiedLocalRecords() {
  const records = loadRecords()
  const removable = records
    .filter(record => record.transaction?.syncState === 'synced')
    .sort((left, right) => right.timestamp - left.timestamp)
    .slice(RETAIN_SYNCED_RECORDS)
  const removed = new Set<string>()
  for (const record of removable) {
    if (record.capturedImageId) await deleteCapturedEvidence(record.capturedImageId)
    removed.add(record.id)
  }
  if (removed.size) saveRecords(records.filter(record => !removed.has(record.id)))
}

async function runPendingSync(): Promise<SyncSummary> {
  if (!isSupabaseConfigured()) throw new Error('Supabase is missing from this build. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy or rebuild the kiosk.')
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

      const cloudRecord: Database['public']['Tables']['grading_records']['Insert'] = {
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
        override_actor: record.result?.overrideActor ?? null,
        override_at: record.result?.overrideAt ?? null,
        capture_id: record.result?.captureId ?? null,
        inference_id: record.result?.inferenceId ?? null,
        raw_confidence: record.result?.rawConfidence ?? null,
        scores: record.result?.scores ?? null,
        image_type: record.result?.imageType ?? null,
        model_source: record.result?.modelSource ?? null,
        image_path: imagePath,
        captured_at: new Date(evidence?.capturedAt ?? record.timestamp).toISOString(),
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from('grading_records').upsert(cloudRecord, { onConflict: 'id' })
      if (error) throw error

      const verifiedFields = 'id,user_id,source,station_id,session_id,grader_name,sample_type,fish_id,weight_kg,grade,confidence,result_status,original_grade,override_grade,override_reason,override_actor,override_at,capture_id,inference_id,raw_confidence,scores,image_type,model_source,image_path,captured_at'
      const { data: verified, error: verifyError } = await supabase.from('grading_records').select(verifiedFields).eq('id', record.id).single()
      if (verifyError || !verified) throw verifyError ?? new Error('Cloud persistence could not be verified.')
      const expected = cloudRecord as Record<string, unknown>
      const actual = verified as unknown as Record<string, unknown>
      for (const field of verifiedFields.split(',')) {
        if (!sameValue(actual[field], expected[field])) throw new Error(`Cloud verification failed for ${field}. The local record remains pending.`)
      }
      if (evidence && imagePath) {
        const { data: cloudImage, error: imageError } = await supabase.storage.from(BUCKET).download(imagePath)
        if (imageError) throw new Error(`Cloud image verification failed: ${imageError.message}`)
        if (!cloudImage || !await sameBlob(evidence.blob, cloudImage)) throw new Error('Cloud image verification failed: stored bytes do not match the captured evidence.')
      }
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
  await pruneVerifiedLocalRecords()
  return summary
}

export function syncPendingRecords(): Promise<SyncSummary> {
  activeSync ??= runPendingSync().finally(() => { activeSync = null })
  return activeSync
}

export async function fetchCloudRecords(): Promise<GradingRecord[]> {
  if (!isSupabaseConfigured() || !navigator.onLine) return []
  await ensureSupabaseUser()
  const rows: Database['public']['Tables']['grading_records']['Row'][] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await getSupabase().from('grading_records').select('*').order('captured_at', { ascending: false }).range(from, from + 999)
    if (error) throw error
    rows.push(...data)
    if (data.length < 1000) break
  }
  return rows.map(row => ({
    id: row.id, sessionId: row.session_id, timestamp: Date.parse(row.captured_at), time: new Date(row.captured_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    grader: row.grader_name, sample: row.sample_type === 'tail_cut' ? 'Tail cut' : 'Sashibo core', fish: row.fish_id,
    weight: row.weight_kg === null ? '—' : `${row.weight_kg} kg`, grade: row.grade, status: row.override_grade ? 'Override' : row.result_status,
    remoteImagePath: row.image_path ?? undefined,
    result: { status: row.result_status, originalGrade: row.original_grade, originalConfidence: row.confidence, rawConfidence: row.raw_confidence ?? undefined, overrideGrade: row.override_grade, overrideReason: row.override_reason ?? '', overrideActor: row.override_actor ?? undefined, overrideAt: row.override_at ?? undefined, inferenceId: row.inference_id ?? undefined, captureId: row.capture_id ?? undefined, scores: row.scores ?? undefined, imageType: row.image_type ?? undefined, modelSource: row.model_source ?? undefined },
    transaction: { currency: 'PHP', amount: null, syncState: 'synced' },
  }))
}
