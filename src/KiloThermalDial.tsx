import type React from 'react'
import { useEffect, useRef } from 'react'
import { animate, mix, motionValue, stagger, transform } from 'motion/react'
import './thermal-dial.css'

export type KiloThermalDialProps = {
  defaultValue?: number
  min?: number
  max?: number
  size?: number
  theme?: 'light' | 'dark'
  hint?: boolean
  onChange?: (value: number, category: string) => void
}

const N = 96
const A0 = -115
const A1 = 115
const GAP_HALF = (360 - (A1 - A0)) / 2
const CX = 220
const CY = 322
const R = 166
const NEEDLE_TOP = CY - R - 16
const NEEDLE_LEN = 100
const SVGNS = 'http://www.w3.org/2000/svg'

const categoryFor = (v: number) => (v < 20 ? 'Light Cut' : v < 35 ? 'Medium Tuna' : v < 65 ? 'Standard Grade' : 'Jumbo Tuna')

const stops = [0, 25, 50, 75, 120]
const c1 = transform(stops, ['#0284c7', '#0284c7', '#2563eb', '#d97706', '#dc2626'])
const c2 = transform(stops, ['#38bdf8', '#38bdf8', '#3b82f6', '#f59e0b', '#ef4444'])
const c3 = transform(stops, ['#bae6fd', '#bae6fd', '#bfdbfe', '#fef08a', '#fecaca'])

export default function KiloThermalDial({
  defaultValue = 45,
  min = 0,
  max = 120,
  size = 320,
  theme = 'dark',
  hint = true,
  onChange,
}: KiloThermalDialProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const ticksRef = useRef<SVGGElement>(null)
  const needleRef = useRef<SVGGElement>(null)
  const washRef = useRef<HTMLDivElement>(null)
  const bloomRef = useRef<HTMLDivElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)
  const categoryRef = useRef<HTMLHeadingElement>(null)
  const leadRef = useRef<HTMLSpanElement>(null)
  const mainRef = useRef<HTMLSpanElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const glowK = useRef(theme === 'light' ? 0.5 : 1)
  useEffect(() => {
    glowK.current = theme === 'light' ? 0.5 : 1
  }, [theme])

  useEffect(() => {
    const root = rootRef.current!
    const card = cardRef.current!
    const dial = svgRef.current!
    const ticksG = ticksRef.current!
    const needle = needleRef.current!
    const wash = washRef.current!
    const bloom = bloomRef.current!
    const halo = haloRef.current!
    const categoryEl = categoryRef.current!
    const leadDigit = leadRef.current!
    const mainDigit = mainRef.current!
    const hintEl = hintRef.current

    const MIN = min
    const MAX = max
    const START = Math.min(MAX, Math.max(MIN, defaultValue))
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let alive = true
    const cleanups: (() => void)[] = []

    const clamp = (v: number, a = MIN, b = MAX) => Math.min(b, Math.max(a, v))
    const toAngle = (v: number) => A0 + ((v - MIN) / (MAX - MIN)) * (A1 - A0)

    ticksG.replaceChildren()
    const ticks: { el: SVGLineElement; tf: number; edge: number; len: number; op: string }[] = []
    for (let i = 0; i < N; i++) {
      const tf = i / (N - 1)
      const a = A0 + tf * (A1 - A0)
      const line = document.createElementNS(SVGNS, 'line')
      line.setAttribute('x1', String(CX))
      line.setAttribute('x2', String(CX))
      line.setAttribute('y1', String(CY - R))
      line.setAttribute('stroke-width', '1.2')
      line.setAttribute('transform', `rotate(${a.toFixed(2)} ${CX} ${CY})`)
      ticksG.appendChild(line)
      const edge = 1 - Math.pow(Math.abs(a) / 120, 4)
      ticks.push({ el: line, tf, edge, len: -1, op: '' })
    }

    let shownInt: number | null = null
    function roll(el: HTMLElement, ch: string, dir: number) {
      if (el.textContent === ch) return
      el.textContent = ch
      if (reduce || !dir) return
      animate(el, { y: [dir * 22, 0] }, { type: 'spring', stiffness: 600, damping: 34 })
      animate(el, { opacity: [0.35, 1], filter: ['blur(5px)', 'blur(0px)'] }, { duration: 0.24, ease: 'easeOut' })
    }
    function setDigits(n: number, dir: number) {
      const s = String(Math.abs(n))
      const lead = (n < 0 ? '−' : '') + s.slice(0, -1)
      roll(leadDigit, lead, dir)
      roll(mainDigit, s[s.length - 1], dir)
    }

    let categoryName: string | null = null
    let categoryTimer: ReturnType<typeof setTimeout> | undefined
    const OUT_MS = 160
    function letters(word: string) {
      categoryEl.replaceChildren(
        ...[...word].map(ch => Object.assign(document.createElement('span'), { textContent: ch }))
      )
      return categoryEl.querySelectorAll('span')
    }
    function lettersIn(word: string) {
      const fresh = letters(word)
      if (reduce) return
      animate(fresh, { y: [14, 0], scale: [0.9, 1] }, { type: 'spring', stiffness: 420, damping: 26, delay: stagger(0.03) })
      animate(fresh, { opacity: [0, 1], filter: ['blur(8px)', 'blur(0px)'] }, { duration: 0.35, delay: stagger(0.03), ease: 'easeOut' })
    }
    function setCategory(name: string) {
      if (name === categoryName) return
      const first = categoryName === null
      categoryName = name
      clearTimeout(categoryTimer)
      if (first || reduce) return lettersIn(name)
      const old = categoryEl.querySelectorAll('span')
      animate(old, { y: -10, opacity: 0, filter: 'blur(6px)' }, { duration: OUT_MS / 1000, delay: stagger(0.015), ease: 'easeIn' })
      categoryTimer = setTimeout(() => {
        if (alive && categoryName === name) lettersIn(name)
      }, OUT_MS + old.length * 15)
    }
    cleanups.push(() => clearTimeout(categoryTimer))

    let target = reduce ? START : MIN
    let cur = target
    let vel = 0
    let wave = 0
    let lastColorAt: number | null = null
    const glowIn = motionValue(reduce ? 1 : 0)

    function render() {
      const f = clamp((cur - MIN) / (MAX - MIN), 0, 1)

      if (lastColorAt === null || Math.abs(cur - lastColorAt) > 0.05) {
        root.style.setProperty('--pdial-c1', c1(cur))
        root.style.setProperty('--pdial-c2', c2(cur))
        root.style.setProperty('--pdial-c3', c3(cur))
        lastColorAt = cur
      }

      const amp = reduce ? 0 : 0.8 + f * 1.6
      for (let i = 0; i < N; i++) {
        const tk = ticks[i]
        const on = tk.tf <= f + 0.001
        const behind = f - tk.tf
        const comet = on && behind < 0.12 ? (1 - behind / 0.12) * 7 : 0
        const undulate = on ? Math.sin(wave + i * 0.5) * amp : 0
        const len = (on ? 12 : 9) + comet + undulate
        const op = ((on ? 0.42 + (1 - clamp(behind * 2.2, 0, 1)) * 0.58 : 0.26) * tk.edge).toFixed(3)
        if (Math.abs(len - tk.len) > 0.04) {
          tk.el.setAttribute('y2', (CY - R - len).toFixed(2))
          tk.len = len
        }
        if (op !== tk.op) {
          tk.el.setAttribute('stroke-opacity', op)
          tk.op = op
        }
      }

      needle.setAttribute('transform', `rotate(${toAngle(cur).toFixed(2)} ${CX} ${CY})`)

      const breathe = reduce ? 1 : 1 + Math.sin(wave * 0.5) * 0.015
      wash.style.transform = `scaleY(${(mix(0.62, 1.05, f) * breathe).toFixed(4)})`
      const g = glowIn.get() * glowK.current
      bloom.style.opacity = (g * mix(0.4, 0.95, f) * breathe).toFixed(3)
      halo.style.opacity = (g * mix(0.2, 0.6, f)).toFixed(3)

      const r = Math.round(cur)
      if (r !== shownInt) {
        const dir = shownInt === null ? 0 : Math.sign(r - shownInt)
        shownInt = r
        setDigits(r, dir)
        const name = categoryFor(r)
        setCategory(name)
        card.setAttribute('aria-valuenow', String(r))
        card.setAttribute('aria-valuetext', `${r} kilograms, ${name}`)
      }
    }

    let raf = 0
    let last = performance.now()
    function tick(now: number) {
      let frames = Math.min(60, (now - last) / 16.67)
      last = now
      wave += frames * 0.055
      if (reduce) {
        cur = target
      } else {
        const k = 0.16
        const d = 0.76
        while (frames > 0) {
          const dt = Math.min(1, frames)
          frames -= dt
          vel += (target - cur) * k * dt
          vel *= Math.pow(d, dt)
          cur += vel * dt
        }
        if (Math.abs(target - cur) < 0.02 && Math.abs(vel) < 0.02) {
          cur = target
          vel = 0
        }
      }
      render()
      raf = requestAnimationFrame(tick)
    }
    cleanups.push(() => cancelAnimationFrame(raf))

    let reported = START
    const setTarget = (v: number) => {
      target = clamp(Math.round(v))
      if (target !== reported) {
        reported = target
        onChangeRef.current?.(target, categoryFor(target))
      }
    }

    let introTimer: ReturnType<typeof setTimeout> | undefined
    function intro() {
      if (!alive) return
      last = performance.now()
      raf = requestAnimationFrame(tick)
      if (reduce) {
        card.style.opacity = '1'
        if (hintEl) hintEl.style.opacity = '1'
        return
      }
      animate(card, { scale: [0.88, 1], y: [36, 0] }, { type: 'spring', stiffness: 140, damping: 18 })
      animate(card, { opacity: [0, 1], filter: ['blur(18px)', 'blur(0px)'] }, { duration: 0.65, ease: 'easeOut' })
      animate(ticks.map(t => t.el), { opacity: [0, 1] }, { duration: 0.3, delay: stagger(0.006, { startDelay: 0.2, from: 'center' }) })
      animate(needle, { opacity: [0, 1] }, { duration: 0.4, delay: 0.45 })
      animate(glowIn, 1, { duration: 1.4, delay: 0.3, ease: 'easeOut' })
      if (hintEl) animate(hintEl, { opacity: [0, 1], y: [6, 0] }, { duration: 0.6, delay: 1.4, ease: 'easeOut' })
      introTimer = setTimeout(() => {
        if (alive) target = START
      }, 380)
    }
    cleanups.push(() => clearTimeout(introTimer))
    void Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 700))]).then(intro)

    let dragging = false
    function valueFromPointer(e: PointerEvent) {
      const b = dial.getBoundingClientRect()
      const x = ((e.clientX - b.left) / b.width) * 440 - CX
      const y = ((e.clientY - b.top) / b.height) * 458 - CY
      let a = (Math.atan2(x, -y) * 180) / Math.PI
      if (a > A1) a = a < A1 + GAP_HALF ? A1 : A0
      if (a < A0) a = a > A0 - GAP_HALF ? A0 : A1
      return MIN + ((a - A0) / (A1 - A0)) * (MAX - MIN)
    }
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return
      dragging = true
      card.dataset.dragging = 'true'
      card.setPointerCapture(e.pointerId)
      setTarget(valueFromPointer(e))
    }
    const onMove = (e: PointerEvent) => {
      if (dragging) setTarget(valueFromPointer(e))
    }
    const release = () => {
      if (!dragging) return
      dragging = false
      card.dataset.dragging = 'false'
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setTarget(target - Math.sign(e.deltaY))
    }
    const onKey = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 5 : 1
      const map: Record<string, number> = { ArrowUp: step, ArrowRight: step, ArrowDown: -step, ArrowLeft: -step }
      if (e.key in map) setTarget(target + map[e.key])
      else if (e.key === 'Home') setTarget(MIN)
      else if (e.key === 'End') setTarget(MAX)
      else return
      e.preventDefault()
    }
    card.addEventListener('pointerdown', onDown)
    card.addEventListener('pointermove', onMove)
    card.addEventListener('pointerup', release)
    card.addEventListener('pointercancel', release)
    card.addEventListener('wheel', onWheel, { passive: false })
    card.addEventListener('keydown', onKey)
    cleanups.push(() => {
      card.removeEventListener('pointerdown', onDown)
      card.removeEventListener('pointermove', onMove)
      card.removeEventListener('pointerup', release)
      card.removeEventListener('pointercancel', release)
      card.removeEventListener('wheel', onWheel)
      card.removeEventListener('keydown', onKey)
    })

    return () => {
      alive = false
      cleanups.forEach(fn => fn())
    }
  }, [min, max, defaultValue])

  return (
    <div
      ref={rootRef}
      className="pdial"
      data-theme={theme}
      style={{ '--pdial-w': `min(${size}px, 80vw)` } as React.CSSProperties}
    >
      <div className="pdial__wrap">
        <div ref={haloRef} className="pdial__halo" aria-hidden="true" />
        <div ref={bloomRef} className="pdial__bloom" aria-hidden="true" />

        <div
          ref={cardRef}
          className="pdial__card"
          tabIndex={0}
          role="slider"
          aria-label="Tuna Weight"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={defaultValue}
          aria-valuetext={`${defaultValue} kg, ${categoryFor(defaultValue)}`}
        >
          <div className="pdial__clip">
            <div ref={washRef} className="pdial__wash" />
            <div className="pdial__walls" />
          </div>
          <div className="pdial__rim" />

          <svg ref={svgRef} className="pdial__dial" viewBox="0 0 440 458" aria-hidden="true">
            <defs>
              <linearGradient id="pdial-needle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: 'var(--pdial-ink)' }} stopOpacity="1" />
                <stop offset="1" style={{ stopColor: 'var(--pdial-ink)' }} stopOpacity=".12" />
              </linearGradient>
            </defs>
            <g ref={ticksRef} className="pdial__ticks" strokeLinecap="round" />
            <g ref={needleRef} className="pdial__needle">
              <rect x={CX - 0.9} y={NEEDLE_TOP} width="1.8" height={NEEDLE_LEN} rx=".9" fill="url(#pdial-needle)" />
            </g>
          </svg>

          <h3 ref={categoryRef} className="pdial__season" aria-hidden="true" />

          <div className="pdial__value" aria-hidden="true">
            <div className="pdial__num">
              <span className="pdial__slot pdial__lead">
                <span ref={leadRef} />
              </span>
              <span className="pdial__slot pdial__main">
                <span ref={mainRef} />
                <span className="pdial__kilo-unit">kg</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {hint && (
        <p ref={hintRef} className="pdial__hint">
          Drag dial to set station scale calibration
        </p>
      )}
    </div>
  )
}
