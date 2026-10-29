import { randomGenerator, randomBetween, round } from '../utils/random'

export type SeriesKey = 'compute' | 'storage' | 'database' | 'network'

export type DataRecord = {
  date: Date;
  compute: number;
  storage: number;
  database: number;
  network: number;
}

export const series: { key: SeriesKey; label: string }[] = [
  { key: 'compute', label: 'Compute' },
  { key: 'storage', label: 'Storage' },
  { key: 'database', label: 'Database' },
  { key: 'network', label: 'Network' },
]

export const formatMonth = (date: Date): string => date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
export const formatValue = (value: number): string => `$${value}K`

// Monthly cloud spend by service, in thousands of dollars, over two years
export function getData (seed: number): DataRecord[] {
  const random = randomGenerator(seed)
  const spend = {
    compute: randomBetween(random, 40, 60),
    storage: randomBetween(random, 15, 25),
    database: randomBetween(random, 20, 30),
    network: randomBetween(random, 8, 14),
  }

  return Array.from({ length: 24 }, (_, month) => {
    series.forEach(s => { spend[s.key] *= 1 + randomBetween(random, -0.07, 0.09) })
    return {
      date: new Date(2024, month, 1),
      compute: round(spend.compute),
      storage: round(spend.storage),
      database: round(spend.database),
      network: round(spend.network),
    }
  })
}
