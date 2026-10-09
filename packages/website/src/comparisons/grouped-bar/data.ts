import { randomGenerator, randomBetween, round } from '../utils/random'

export type SeriesKey = 'y2023' | 'y2024' | 'y2025'

export type DataRecord = {
  region: string;
  y2023: number;
  y2024: number;
  y2025: number;
}

export const series: { key: SeriesKey; label: string }[] = [
  { key: 'y2023', label: '2023' },
  { key: 'y2024', label: '2024' },
  { key: 'y2025', label: '2025' },
]

export const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa']

export const formatValue = (value: number): string => `$${value}M`

// Annual revenue by region, in millions of dollars
export function getData (seed: number): DataRecord[] {
  const random = randomGenerator(seed)
  return regions.map(region => {
    const y2023 = randomBetween(random, 20, 120)
    const y2024 = y2023 * (1 + randomBetween(random, -0.15, 0.35))
    const y2025 = y2024 * (1 + randomBetween(random, -0.15, 0.35))
    return { region, y2023: round(y2023), y2024: round(y2024), y2025: round(y2025) }
  })
}
