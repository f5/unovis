import { randomGenerator, randomBetween, round } from '../utils/random'

export type DataRecord = {
  source: string;
  sessions: number;
}

export const sources = ['Organic search', 'Direct', 'Referral', 'Social', 'Email', 'Paid search']

export const formatValue = (value: number): string => `${value.toFixed(1)}K`
export const getTotal = (data: DataRecord[]): number => data.reduce((sum, d) => sum + d.sessions, 0)

// Website sessions in one month by traffic source, in thousands
export function getData (seed: number): DataRecord[] {
  const random = randomGenerator(seed)
  return sources.map(source => ({ source, sessions: round(randomBetween(random, 8, 60)) }))
}
