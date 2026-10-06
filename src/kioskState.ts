export type Screen =
  | 'welcome'
  | 'select-role'
  | 'admin'
  | 'admin-dashboard'
  | 'grader'
  | 'grader-dashboard'
  | 'sample'
  | 'association'
  | 'tutorial'
  | 'weight'
  | 'camera'
  | 'review'
  | 'analysis'
  | 'individual-result'
  | 'overview'
  | 'print'
  | 'complete'

export type Role = 'admin' | 'expert'
export type SampleType = 'Sashibo core' | 'Tail cut'
export type Grade = 'A' | 'B' | 'C'
export type DemoOutcome = 'valid' | 'uncertain' | 'invalid'
export type SameFish = 'same' | 'different' | null

export interface SampleResult {
  sample: SampleType
  fishId: string
  status: DemoOutcome
  originalGrade: Grade | null
  originalConfidence: number | null
  overrideGrade: Grade | null
  overrideReason: string
  captured: boolean
  weight: string
}

export interface Session {
  screen: Screen
  role: Role | null
  graderName: string
  rememberName: boolean
  selectedSamples: SampleType[]
  sameFish: SameFish
  fishWeights: Record<string, string>
  tutorialStep: number
  currentSampleIndex: number
  demoOutcome: DemoOutcome
  results: Partial<Record<SampleType, SampleResult>>
  adminPin: string
  adminError: string
  adminAuthenticated: boolean
  printIndex: number
  printedSamples: SampleType[]
}

export const sampleOrder: SampleType[] = ['Sashibo core', 'Tail cut']

export const initialSession: Session = {
  screen: 'welcome',
  role: null,
  graderName: typeof window !== 'undefined' ? (localStorage.getItem('tunaeye-grader-name') ?? 'Maria Santos') : 'Maria Santos',
  rememberName: true,
  selectedSamples: ['Sashibo core'],
  sameFish: null,
  fishWeights: {},
  tutorialStep: 0,
  currentSampleIndex: 0,
  demoOutcome: 'valid',
  results: {},
  adminPin: '',
  adminError: '',
  adminAuthenticated: false,
  printIndex: 0,
  printedSamples: [],
}

export type Action =
  | { type: 'navigate'; screen: Screen }
  | { type: 'setRole'; role: Role }
  | { type: 'setGraderName'; value: string }
  | { type: 'setRememberName'; value: boolean }
  | { type: 'setSamples'; samples: SampleType[] }
  | { type: 'setSameFish'; value: Exclude<SameFish, null> }
  | { type: 'setFishWeight'; fishId: string; value: string }
  | { type: 'setTutorialStep'; step: number }
  | { type: 'setDemoOutcome'; outcome: DemoOutcome }
  | { type: 'captured' }
  | { type: 'startAnalysis' }
  | { type: 'finishAnalysis'; outcome: DemoOutcome }
  | { type: 'setAdminPin'; value: string }
  | { type: 'adminError'; message: string }
  | { type: 'adminAuthenticated' }
  | { type: 'setOverride'; sample: SampleType; grade: Grade; reason: string }
  | { type: 'nextSample' }
  | { type: 'startPrinting' }
  | { type: 'printed'; sample: SampleType }
  | { type: 'gradeAnother' }
  | { type: 'reset' }

function fishForSample(sample: SampleType, sameFish: SameFish): string {
  return sameFish === 'different' ? (sample === 'Sashibo core' ? 'Fish 1' : 'Fish 2') : 'Fish 1'
}

function resultFor(state: Session, sample: SampleType): SampleResult | undefined {
  return state.results[sample]
}

export function currentSample(state: Session): SampleType {
  return state.selectedSamples[state.currentSampleIndex] ?? state.selectedSamples[0] ?? 'Sashibo core'
}

export function fishIdForSample(state: Session, sample: SampleType): string {
  return fishForSample(sample, state.sameFish)
}

export function weightForSample(state: Session, sample: SampleType): string {
  return state.fishWeights[fishForSample(sample, state.sameFish)] ?? ''
}

export function reducer(state: Session, action: Action): Session {
  switch (action.type) {
    case 'navigate':
      return { ...state, screen: action.screen }
    case 'setRole':
      return { ...state, role: action.role }
    case 'setGraderName':
      return { ...state, graderName: action.value }
    case 'setRememberName':
      return { ...state, rememberName: action.value }
    case 'setSamples':
      return { ...state, selectedSamples: action.samples, currentSampleIndex: 0 }
    case 'setSameFish':
      return { ...state, sameFish: action.value }
    case 'setFishWeight':
      return { ...state, fishWeights: { ...state.fishWeights, [action.fishId]: action.value } }
    case 'setTutorialStep':
      return { ...state, tutorialStep: action.step }
    case 'setDemoOutcome':
      return { ...state, demoOutcome: action.outcome }
    case 'captured':
      return { ...state, screen: 'review' }
    case 'startAnalysis':
      return { ...state, screen: 'analysis' }
    case 'finishAnalysis': {
      const sample = currentSample(state)
      const grade: Grade | null = action.outcome === 'valid' ? (sample === 'Sashibo core' ? 'A' : 'B') : null
      const confidence = action.outcome === 'valid' ? (sample === 'Sashibo core' ? 96 : 91) : action.outcome === 'uncertain' ? 61 : null
      return {
        ...state,
        screen: 'individual-result',
        results: {
          ...state.results,
          [sample]: {
            sample,
            fishId: fishForSample(sample, state.sameFish),
            status: action.outcome,
            originalGrade: grade,
            originalConfidence: confidence,
            overrideGrade: resultFor(state, sample)?.overrideGrade ?? null,
            overrideReason: resultFor(state, sample)?.overrideReason ?? '',
            captured: true,
            weight: weightForSample(state, sample),
          },
        },
      }
    }
    case 'setAdminPin':
      return { ...state, adminPin: action.value, adminError: '' }
    case 'adminError':
      return { ...state, adminError: action.message }
    case 'adminAuthenticated':
      return { ...state, adminAuthenticated: true, adminError: '', screen: 'admin-dashboard' }
    case 'setOverride': {
      const existing = state.results[action.sample]
      if (!existing) return state
      return { ...state, results: { ...state.results, [action.sample]: { ...existing, status: 'valid', overrideGrade: action.grade, overrideReason: action.reason } } }
    }
    case 'nextSample':
      return { ...state, currentSampleIndex: state.currentSampleIndex + 1, screen: 'camera', demoOutcome: 'valid' }
    case 'startPrinting':
      return { ...state, printIndex: 0, printedSamples: [], screen: 'print' }
    case 'printed':
      return { ...state, printedSamples: [...state.printedSamples, action.sample], printIndex: state.printIndex + 1 }
    case 'gradeAnother':
      return { ...initialSession, screen: 'sample', role: 'expert', graderName: state.graderName, rememberName: state.rememberName }
    case 'reset':
      return { ...initialSession }
    default:
      return state
  }
}
