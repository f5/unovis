import { randomGenerator, randomBetween } from '../utils/random'

export type DataRecord = {
  date: Date;
  requests: number;
}

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
export const formatValue = (value: number): string => compact.format(value)
export const formatDay = (date: Date): string => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
export const formatDate = (date: Date): string => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
export const formatMonth = (date: Date): string => date.toLocaleDateString('en-US', { month: 'short' })

/** The selected days and their total, e.g. "Mar 3 – Apr 1, 2025 · 52.4M requests"; the whole year without a range */
export function formatSelection (data: DataRecord[], range?: [number | Date, number | Date]): string {
  const [from, to] = range ? [+range[0], +range[1]] : [-Infinity, Infinity]
  const days = data.filter(d => +d.date >= from && +d.date <= to)
  if (!days.length) return 'No days selected'
  const total = days.reduce((sum, d) => sum + d.requests, 0)
  return `${formatDay(days[0].date)} – ${formatDate(days[days.length - 1].date)} · ${formatValue(total)} requests`
}

// API requests per day in 2025: steady growth, quieter weekends, and a product launch that brings a week of extra traffic
export function getData (seed: number): DataRecord[] {
  const random = randomGenerator(seed)
  const launch = Math.round(randomBetween(random, 90, 270))
  let level = randomBetween(random, 1.1e6, 1.4e6)

  return Array.from({ length: 365 }, (_, day) => {
    const date = new Date(2025, 0, 1 + day)
    level *= 1 + randomBetween(random, -0.006, 0.008)
    const weekend = date.getDay() === 0 || date.getDay() === 6 ? 0.7 : 1
    const launchBoost = day >= launch && day < launch + 7 ? 1 + 0.9 * (1 - (day - launch) / 7) : 1
    return {
      date,
      requests: Math.round(level * weekend * launchBoost * randomBetween(random, 0.93, 1.07)),
    }
  })
}
