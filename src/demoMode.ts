import type { DemoOutcome, Grade, SampleType } from './kioskState'
import type { PiGradeResult } from './piClient'

const DEMO_FLAG = 'tunaeye-demo-mode'
const gradeHints = new Map<SampleType, Grade>()
const demoAvailable = import.meta.env.VITE_DEMO_MODE === 'true'
let enabled = demoAvailable

export function initDemoMode() {
  if (typeof window === 'undefined') return
  if (!demoAvailable) {
    enabled = false
    localStorage.removeItem(DEMO_FLAG)
    return
  }
  const params = new URLSearchParams(window.location.search)
  if (params.get('demo') === '1') {
    enabled = true
    localStorage.setItem(DEMO_FLAG, '1')
  } else if (localStorage.getItem(DEMO_FLAG) === '1') {
    enabled = true
  }
}

export function isDemoMode() {
  return enabled
}

export function demoAssetPath(sample: SampleType, grade: Grade) {
  const prefix = sample === 'Tail cut' ? 'TAILCUT' : 'SASHIBOCORE'
  return `/DEMO_SAMPLES/${prefix}_${grade}.png`
}

export function defaultDemoGrade(sampleIndex: number): Grade {
  return (['A', 'B', 'C'] as Grade[])[Math.min(sampleIndex, 2)] ?? 'A'
}

export function parseDemoGradeFromFilename(filename: string): Grade | null {
  const match = filename.toUpperCase().match(/(?:SASHIBOCORE|TAILCUT)_([ABC])\.(?:PNG|JPG|JPEG|WEBP)$/)
  return match ? (match[1] as Grade) : null
}

export function setDemoGradeHint(sample: SampleType, grade: Grade) {
  gradeHints.set(sample, grade)
}

function hintedGrade(sample: SampleType): Grade {
  return gradeHints.get(sample) ?? 'A'
}

function demoScores(grade: Grade): Record<string, number> {
  const base = grade === 'A' ? 0.96 : grade === 'B' ? 0.91 : 0.78
  return {
    GRADE_A: grade === 'A' ? base : 0.04,
    GRADE_B: grade === 'B' ? base : 0.03,
    GRADE_C: grade === 'C' ? base : 0.02,
    INVALID: 0.01,
  }
}

export async function loadDemoSampleBlob(sample: SampleType, sampleIndex: number): Promise<Blob> {
  const grade = defaultDemoGrade(sampleIndex)
  setDemoGradeHint(sample, grade)
  const response = await fetch(demoAssetPath(sample, grade))
  if (!response.ok) throw new Error(`Demo sample missing: ${demoAssetPath(sample, grade)}`)
  return response.blob()
}

export function getDemoPreviewUrl(sample: SampleType, sampleIndex: number) {
  return demoAssetPath(sample, defaultDemoGrade(sampleIndex))
}

export async function gradeDemoImage(sample: SampleType): Promise<PiGradeResult> {
  await new Promise(resolve => window.setTimeout(resolve, 900))
  const grade = hintedGrade(sample)
  const confidence = grade === 'A' ? 96.3 : grade === 'B' ? 91.2 : 78.5
  const outcome: DemoOutcome = confidence < 70 ? 'uncertain' : 'valid'
  return {
    id: `demo-${crypto.randomUUID()}`,
    captureId: `demo-capture-${crypto.randomUUID()}`,
    imageType: sample === 'Tail cut' ? 'tailcut' : 'sashibocore',
    modelSource: 'demo',
    outcome,
    grade,
    confidence,
    rawConfidence: confidence / 100,
    scores: demoScores(grade),
  }
}
