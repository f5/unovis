import { randomGenerator, randomBetween } from '../utils/random'

export type DataRecord = {
  platform: string;
  os: string;
  browser: string;
  sessions: number;
}

// Every platform, operating system and browser combination, with a typical range of monthly sessions in thousands
const combinations: [string, string, string, number, number][] = [
  ['Desktop', 'Windows', 'Chrome', 120, 180],
  ['Desktop', 'Windows', 'Edge', 40, 70],
  ['Desktop', 'Windows', 'Firefox', 15, 30],
  ['Desktop', 'macOS', 'Chrome', 50, 80],
  ['Desktop', 'macOS', 'Safari', 35, 60],
  ['Desktop', 'Linux', 'Chrome', 10, 25],
  ['Desktop', 'Linux', 'Firefox', 8, 18],
  ['Mobile', 'iOS', 'Safari', 70, 110],
  ['Mobile', 'iOS', 'Chrome', 15, 30],
  ['Mobile', 'Android', 'Chrome', 60, 100],
  ['Mobile', 'Android', 'Samsung Internet', 10, 25],
  ['Tablet', 'iPadOS', 'Safari', 15, 35],
  ['Tablet', 'Android', 'Chrome', 5, 15],
]

export const formatValue = (value: number): string => `${value.toLocaleString('en-US')}K`

// Website sessions in one month by platform, operating system and browser, in thousands
export function getData (seed: number): DataRecord[] {
  const random = randomGenerator(seed)
  return combinations.map(([platform, os, browser, min, max]) => ({ platform, os, browser, sessions: Math.round(randomBetween(random, min, max)) }))
}
