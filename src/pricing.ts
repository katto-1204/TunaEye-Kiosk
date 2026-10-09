import type { Grade } from './kioskState'

export const DEFAULT_PRICES: Record<Grade, number> = { A: 420, B: 350, C: 280 }

export function loadPriceSchedule(): Record<Grade, number> {
  try {
    const saved = JSON.parse(localStorage.getItem('tunaeye-prices') ?? '{}') as Partial<Record<Grade, string | number>>
    return Object.fromEntries((['A', 'B', 'C'] as Grade[]).map(grade => [grade, Number(saved[grade]) || DEFAULT_PRICES[grade]])) as Record<Grade, number>
  } catch { return DEFAULT_PRICES }
}

export function priceSnapshot(grade: string, weight: string | number) {
  if (!['A', 'B', 'C'].includes(grade)) return { unitRatePerKg: null, amount: null }
  const unitRatePerKg = loadPriceSchedule()[grade as Grade]
  const kilograms = typeof weight === 'number' ? weight : Number.parseFloat(weight)
  return { unitRatePerKg, amount: Number.isFinite(kilograms) ? Math.round(kilograms * unitRatePerKg * 100) / 100 : null }
}

export const peso = (value: number | null | undefined) => value == null ? '—' : `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
