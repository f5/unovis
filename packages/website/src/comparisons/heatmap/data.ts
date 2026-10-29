import { randomGenerator, randomBetween, round } from '../utils/random'

export type DataRecord = {
  day: string;
  hour: number;
  /** Share of the API requests that failed, in percent; `null` while the monitoring was down */
  errorRate: number | null;
}

export const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const hours = Array.from({ length: 24 }, (_, hour) => hour)

/** The color scale's domain, in percent: every library splits it into equal buckets */
export const rateDomain: [number, number] = [0, 4]

export const formatRate = (value: number): string => `${value.toFixed(1)}%`
export const formatHour = (hour: number): string => `${hour % 12 || 12}${hour < 12 ? 'a' : 'p'}`
export const formatCell = (d: DataRecord): string => `${d.day} ${formatHour(d.hour)}: ${d.errorRate === null ? 'No data' : formatRate(d.errorRate)}`

/** The equal buckets a color scale of `count` colors splits `rateDomain` into, for the legends */
export function getBuckets (count: number): { min: number; max: number; label: string }[] {
  const step = (rateDomain[1] - rateDomain[0]) / count
  return Array.from({ length: count }, (_, i) => {
    const min = rateDomain[0] + i * step
    return { min, max: min + step, label: `${min}–${min + step}%` }
  })
}

// API error rate over one week by hour of day, in percent: one record per hour and day, hour by hour.
// Errors follow the traffic, one weekday has an incident, and three hours are missing while the monitoring was down
export function getData (seed: number): DataRecord[] {
  const random = randomGenerator(seed)
  const incidentDay = Math.floor(random() * 5)
  const incidentHour = 9 + Math.floor(random() * 8)
  const outageDay = Math.floor(random() * days.length)
  const outageHour = Math.floor(random() * 22)

  return hours.flatMap(hour => days.map((day, d) => {
    if (d === outageDay && hour >= outageHour && hour < outageHour + 3) return { day, hour, errorRate: null }

    const traffic = (d < 5 ? 1 : 0.4) * (hour >= 8 && hour <= 18 ? 1 : 0.3)
    const incident = d === incidentDay && Math.abs(hour - incidentHour) <= 1 ? 1.5 : 0
    const errorRate = 0.2 + traffic * randomBetween(random, 1, 2.2) + randomBetween(random, 0, 0.5) + incident
    return { day, hour, errorRate: round(Math.min(errorRate, 3.9)) }
  }))
}
