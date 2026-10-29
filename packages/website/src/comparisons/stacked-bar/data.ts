import { randomGenerator, randomBetween } from '../utils/random'

export type SeriesKey = 'low' | 'medium' | 'high' | 'critical'

export type DataRecord = {
  month: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export const series: { key: SeriesKey; label: string }[] = [
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
  { key: 'critical', label: 'Critical' },
]

export const formatValue = (value: number): string => value.toLocaleString('en-US')

// Support tickets opened per month in 2025, by priority
export function getData (seed: number): DataRecord[] {
  const random = randomGenerator(seed)
  return Array.from({ length: 12 }, (_, month) => {
    const volume = randomBetween(random, 0.6, 1.4)
    return {
      month: new Date(2025, month, 1).toLocaleDateString('en-US', { month: 'short' }),
      low: Math.round(volume * randomBetween(random, 120, 220)),
      medium: Math.round(volume * randomBetween(random, 80, 160)),
      high: Math.round(volume * randomBetween(random, 30, 80)),
      critical: Math.round(volume * randomBetween(random, 5, 25)),
    }
  })
}
