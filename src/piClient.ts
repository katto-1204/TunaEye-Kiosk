import { gradeDemoImage, isDemoMode, loadDemoSampleBlob } from './demoMode'
import type { DemoOutcome, Grade, SampleType } from './kioskState'

const DEFAULT_API_URL = 'http://10.42.0.1:5000'
const DEFAULT_CAMERA_URL = 'http://10.42.0.1:8080'
const TIMEOUT_MS = 8_000

export interface PiGradeResult {
  id: string
  captureId: string
  outcome: DemoOutcome
  grade: Grade | null
  confidence: number | null
  scores: Record<string, number>
}

export const getPiSettings = () => {
  const apiUrl = (localStorage.getItem('tunaeye-rpi-url') || import.meta.env.VITE_PI_API_URL || DEFAULT_API_URL).replace(/\/$/, '')
  const cameraUrl = (localStorage.getItem('tunaeye-camera-url') || import.meta.env.VITE_PI_CAMERA_URL || DEFAULT_CAMERA_URL).replace(/\/$/, '')
  return { apiUrl, cameraUrl, streamUrl: `${cameraUrl}/stream`, snapshotUrl: `${cameraUrl}/snapshot` }
}

async function request(url: string, init?: RequestInit, attempts = 2): Promise<Response> {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) })
      if (!response.ok) throw new Error(`Raspberry Pi returned HTTP ${response.status}.`)
      return response
    } catch (error) {
      lastError = error
      if (attempt + 1 < attempts) await new Promise(resolve => setTimeout(resolve, 350 * (attempt + 1)))
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Raspberry Pi is unavailable.')
}

export async function checkPiHealth(apiUrl = getPiSettings().apiUrl) {
  apiUrl = apiUrl.replace(/\/$/, '')
  return request(`${apiUrl}/status`, undefined, 3).then(response => response.json())
}

export async function capturePiImage(sample?: SampleType, sampleIndex = 0): Promise<Blob> {
  if (isDemoMode() && sample) return loadDemoSampleBlob(sample, sampleIndex)
  const { snapshotUrl } = getPiSettings()
  const blob = await request(snapshotUrl, undefined, 2).then(response => response.blob())
  if (!blob.type.startsWith('image/') || blob.size === 0) throw new Error('The Raspberry Pi returned an invalid camera image.')
  return blob
}

export async function gradePiImage(blob: Blob, sample: SampleType): Promise<PiGradeResult> {
  if (isDemoMode()) return gradeDemoImage(sample)
  const { apiUrl } = getPiSettings()
  const form = new FormData()
  form.append('image_type', sample === 'Tail cut' ? 'tailcut' : 'sashibocore')
  form.append('image', blob, 'capture.jpg')
  const data = await request(`${apiUrl}/grade`, { method: 'POST', body: form }, 2).then(response => response.json()) as Record<string, unknown>
  const rawGrade = typeof data.grade === 'string' ? data.grade : ''
  const grade = ({ GRADE_A: 'A', GRADE_B: 'B', GRADE_C: 'C', A: 'A', B: 'B', C: 'C' } as Record<string, Grade>)[rawGrade] ?? null
  const rawConfidence = typeof data.confidence === 'number' ? data.confidence : null
  const confidence = rawConfidence === null ? null : Math.round((rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence) * 100) / 100
  const invalid = rawGrade === 'INVALID'
  if (!invalid && (!grade || confidence === null || confidence < 0 || confidence > 100)) throw new Error('The Raspberry Pi returned an invalid grading result.')
  return {
    id: typeof data.id === 'string' ? data.id : crypto.randomUUID(),
    captureId: typeof data.capture_id === 'string' ? data.capture_id : crypto.randomUUID(),
    outcome: invalid ? 'invalid' : confidence! < 70 ? 'uncertain' : 'valid',
    grade,
    confidence,
    scores: data.scores && typeof data.scores === 'object' ? data.scores as Record<string, number> : {},
  }
}
