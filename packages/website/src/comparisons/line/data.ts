import { randomGenerator, randomBetween, round } from '../utils/random'

export type SeriesKey = 'web' | 'ios' | 'android'

export type DataRecord = {
  date: Date;
  /** Monthly active users, in millions; `undefined` for the months with no data */
  web: number | undefined;
  ios: number | undefined;
  android: number | undefined;
}

export const series: { key: SeriesKey; label: string }[] = [
  { key: 'web', label: 'Web' },
  { key: 'ios', label: 'iOS' },
  { key: 'android', label: 'Android' },
]

export const formatMonth = (date: Date): string => date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
export const formatValue = (value: number): string => `${value}M`

// Monthly active users by platform, in millions, over three years.
// Analytics outages left a few months without data for the iOS and Android apps
export function getData (seed: number): DataRecord[] {
  const random = randomGenerator(seed)
  const users = {
    web: randomBetween(random, 30, 40),
    ios: randomBetween(random, 16, 24),
    android: randomBetween(random, 22, 30),
  }
  const iosOutage = Math.floor(randomBetween(random, 4, 14))
  const androidOutage = Math.floor(randomBetween(random, 18, 29))
  const isMissing = (month: number, outageStart: number, outageLength: number): boolean => month >= outageStart && month < outageStart + outageLength

  return Array.from({ length: 36 }, (_, month) => {
    series.forEach(s => { users[s.key] *= 1 + randomBetween(random, -0.06, 0.08) })
    return {
      date: new Date(2023, month, 1),
      web: round(users.web),
      ios: isMissing(month, iosOutage, 3) ? undefined : round(users.ios),
      android: isMissing(month, androidOutage, 4) ? undefined : round(users.android),
    }
  })
}
