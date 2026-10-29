import { randomGenerator, randomBetween, round } from '../utils/random'

export type Metric = {
  key: string;
  label: string;
  /** The daily goal: a bar of this value is full length */
  goal: number;
  unit: string;
  digits: number;
}

export type DataRecord = Metric & {
  /** Today's value, never above the goal */
  value: number;
}

export const metrics: Metric[] = [
  { key: 'steps', label: 'Steps', goal: 10000, unit: 'steps', digits: 0 },
  { key: 'energy', label: 'Active energy', goal: 600, unit: 'kcal', digits: 0 },
  { key: 'exercise', label: 'Exercise', goal: 30, unit: 'min', digits: 0 },
  { key: 'stand', label: 'Stand hours', goal: 12, unit: 'h', digits: 0 },
  { key: 'sleep', label: 'Sleep', goal: 8, unit: 'h', digits: 1 },
  { key: 'water', label: 'Water', goal: 2, unit: 'l', digits: 1 },
]

export const formatValue = (d: DataRecord): string => `${d.value.toLocaleString('en-US')} / ${d.goal.toLocaleString('en-US')} ${d.unit}`
/** Progress towards the goal in percent, for the libraries that draw every bar on one shared scale */
export const percentOfGoal = (d: DataRecord): number => round(d.value / d.goal * 100, 0)

// Today's progress towards six daily health goals
export function getData (seed: number): DataRecord[] {
  const random = randomGenerator(seed)
  return metrics.map(m => ({ ...m, value: round(randomBetween(random, 0.2, 1) * m.goal, m.digits) }))
}
