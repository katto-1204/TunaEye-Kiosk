import { gradeDemoImage, isDemoMode, loadDemoSampleBlob } from './demoMode'
import type { DemoOutcome, Grade, SampleType } from './kioskState'

const DEFAULT_API_URL = 'http://10.42.0.1:5000'
const DEFAULT_CAMERA_URL = 'http://10.42.0.1:8080'
const TIMEOUT_MS = 8_000

export interface PiGradeResult {
  id: string
  captureId: string
  imageType: 'sashibocore' | 'tailcut'
  modelSource: 'raspberry-pi' | 'demo'
  outcome: DemoOutcome
  grade: Grade | null
  confidence: number | null
  rawConfidence: number
  scores: Record<string, number>
}

export interface PiStatusResponse {
  status?: string
  service?: string
  version?: string
  model?: string
  models?: { sashibocore?: boolean; tailcut?: boolean }
  classes?: string[]
}

type PiStage = 'status' | 'snapshot' | 'inference'

export class PiIntegrationError extends Error {
  constructor(public stage: PiStage, message: string, public status?: number, options?: ErrorOptions) {
    super(message, options)
    this.name = 'PiIntegrationError'
  }
}

export const getPiSettings = () => {
  if (import.meta.env.VITE_PI_LOCAL_HOSTED === 'true') {
    return { apiUrl: '', cameraUrl: '', streamUrl: '/stream', snapshotUrl: '/snapshot' }
  }
  const apiUrl = (localStorage.getItem('tunaeye-rpi-url') || import.meta.env.VITE_PI_API_URL || DEFAULT_API_URL).replace(/\/$/, '')
  const cameraUrl = (localStorage.getItem('tunaeye-camera-url') || import.meta.env.VITE_PI_CAMERA_URL || DEFAULT_CAMERA_URL).replace(/\/$/, '')
  return { apiUrl, cameraUrl, streamUrl: `${cameraUrl}/stream`, snapshotUrl: `${cameraUrl}/snapshot` }
}

async function request(url: string, stage: PiStage, init?: RequestInit, attempts = 2): Promise<Response> {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) })
      if (!response.ok) throw new PiIntegrationError(stage, `${stage === 'snapshot' ? 'Snapshot' : stage === 'inference' ? 'Inference' : 'Status'} failed: HTTP ${response.status}.`, response.status)
      return response
    } catch (error) {
      lastError = error instanceof PiIntegrationError
        ? error
        : new PiIntegrationError(stage, error instanceof DOMException && error.name === 'TimeoutError'
          ? `${stage === 'snapshot' ? 'Snapshot' : stage === 'inference' ? 'Inference' : 'Status'} request timed out after ${TIMEOUT_MS / 1000} seconds.`
          : `${stage === 'snapshot' ? 'Snapshot' : stage === 'inference' ? 'Inference' : 'Status'} request failed. Check the configured URL, browser CORS, and HTTPS settings.`, undefined, { cause: error })
      if (attempt + 1 < attempts) await new Promise(resolve => setTimeout(resolve, 350 * (attempt + 1)))
    }
  }
  throw lastError
}

export async function checkPiHealth(apiUrl = getPiSettings().apiUrl): Promise<PiStatusResponse> {
  apiUrl = apiUrl.replace(/\/$/, '')
  const response = await request(`${apiUrl}/status`, 'status', undefined, 3)
  try {
    const data = await response.json() as unknown
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Expected an object.')
    return data as PiStatusResponse
  } catch (error) {
    throw new PiIntegrationError('status', 'Status failed: malformed JSON response.', undefined, { cause: error })
  }
}

export async function capturePiImage(sample?: SampleType, sampleIndex = 0): Promise<Blob> {
  if (isDemoMode() && sample) return loadDemoSampleBlob(sample, sampleIndex)
  const { snapshotUrl } = getPiSettings()
  const blob = await request(snapshotUrl, 'snapshot', undefined, 2).then(response => response.blob())
  if (!blob.type.startsWith('image/') || blob.size === 0) throw new PiIntegrationError('snapshot', 'Snapshot failed: the camera returned an invalid image.')
  return blob
}

export async function gradePiImage(blob: Blob, sample: SampleType): Promise<PiGradeResult> {
  if (isDemoMode()) return gradeDemoImage(sample)
  const { apiUrl } = getPiSettings()
  const imageType = sample === 'Tail cut' ? 'tailcut' : 'sashibocore'
  const extension = ({ 'image/png': 'png', 'image/webp': 'webp' } as Record<string, string>)[blob.type] ?? 'jpg'
  const form = new FormData()
  form.append('image_type', imageType)
  form.append('image', blob, `capture.${extension}`)
  const response = await request(`${apiUrl}/grade`, 'inference', { method: 'POST', body: form }, 2)
  let data: Record<string, unknown>
  try {
    const parsed = await response.json() as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Expected an object.')
    data = parsed as Record<string, unknown>
  } catch (error) {
    throw new PiIntegrationError('inference', 'Inference failed: malformed JSON response.', undefined, { cause: error })
  }
  const rawGrade = typeof data.grade === 'string' ? data.grade : ''
  const grade = ({ GRADE_A: 'A', GRADE_B: 'B', GRADE_C: 'C', A: 'A', B: 'B', C: 'C' } as Record<string, Grade>)[rawGrade] ?? null
  const rawConfidence = typeof data.confidence === 'number' ? data.confidence : null
  const confidence = rawConfidence === null ? null : Math.round((rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence) * 100) / 100
  const invalid = rawGrade === 'INVALID'
  const scores = data.scores && typeof data.scores === 'object' && !Array.isArray(data.scores) ? data.scores as Record<string, unknown> : null
  const expectedScores = ['GRADE_A', 'GRADE_B', 'GRADE_C', 'INVALID']
  const validScores = scores && expectedScores.every(key => typeof scores[key] === 'number' && Number.isFinite(scores[key]))
  const id = typeof data.id === 'string' ? data.id.trim() : ''
  const captureId = typeof data.capture_id === 'string' ? data.capture_id.trim() : ''
  if ((!invalid && !grade) || confidence === null || !Number.isFinite(confidence) || confidence < 0 || confidence > 100 || !validScores || !id || !captureId) {
    throw new PiIntegrationError('inference', 'Inference failed: malformed prediction response.')
  }
  if (typeof data.image_type === 'string' && data.image_type !== imageType) throw new PiIntegrationError('inference', 'Inference failed: response capture type does not match the selected sample.')
  return {
    id,
    captureId,
    imageType,
    modelSource: 'raspberry-pi',
    outcome: invalid ? 'invalid' : confidence! < 70 ? 'uncertain' : 'valid',
    grade,
    confidence,
    rawConfidence: rawConfidence!,
    scores: Object.fromEntries(expectedScores.map(key => [key, scores![key] as number])),
  }
}
