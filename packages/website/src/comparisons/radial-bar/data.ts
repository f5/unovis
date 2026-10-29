import { randomGenerator, randomBetween, round } from '../utils/random'

export type Resource = {
  key: string;
  label: string;
  /** The plan's monthly quota: a bar of this value fills its ring */
  quota: number;
  unit: string;
  digits: number;
}

export type DataRecord = Resource & {
  /** Usage this month, never above the quota */
  used: number;
}

export const resources: Resource[] = [
  { key: 'api', label: 'API requests', quota: 5, unit: 'M requests', digits: 2 },
  { key: 'storage', label: 'Storage', quota: 500, unit: 'GB', digits: 0 },
  { key: 'bandwidth', label: 'Bandwidth', quota: 2, unit: 'TB', digits: 2 },
  { key: 'builds', label: 'Build minutes', quota: 3000, unit: 'min', digits: 0 },
  { key: 'seats', label: 'Seats', quota: 25, unit: 'seats', digits: 0 },
]

export const formatUsage = (d: DataRecord): string => `${d.used.toLocaleString('en-US')} / ${d.quota.toLocaleString('en-US')} ${d.unit}`
/** Usage in percent of the quota, for the libraries that draw every ring on one shared scale */
export const percentOfQuota = (d: DataRecord): number => round(d.used / d.quota * 100, 0)
/** The average share of the quotas used, for the label in the middle */
export const formatAverageUsage = (data: DataRecord[]): string => `${Math.round(data.reduce((sum, d) => sum + d.used / d.quota, 0) / data.length * 100)}%`

// A workspace's usage of its plan's five monthly quotas
export function getData (seed: number): DataRecord[] {
  const random = randomGenerator(seed)
  return resources.map(r => ({ ...r, used: round(randomBetween(random, 0.15, 1) * r.quota, r.digits) }))
}
