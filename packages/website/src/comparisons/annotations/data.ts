import { randomGenerator, randomBetween, round } from '../utils/random'

export type DataRecord = {
  date: Date;
  /** Daily active users, in thousands */
  users: number;
}

/** A release or an incident, with the day's value so the callout can point at it */
export type ChartEvent = {
  id: string;
  date: Date;
  users: number;
  title: string;
  detail: string;
}

export type Data = {
  days: DataRecord[];
  events: ChartEvent[];
  /** First and last day of the login outage */
  incident: { start: Date; end: Date };
}

export const formatDay = (date: Date): string => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
export const formatValue = (value: number): string => `${value}K`
/** The whole callout as one sentence */
export const formatEvent = (event: ChartEvent): string => `${event.title}: ${event.detail}`

// Daily active users of a SaaS app from March to May 2025, in thousands, with two releases and a login outage.
// Weekends are quieter, every release brings more users, and the outage day moves with the seed
export function getData (seed: number): Data {
  const random = randomGenerator(seed)
  const releases = [
    { id: 'v3.0', day: 12, title: 'v3.0 release', detail: 'New onboarding flow', lift: 1.08 },
    { id: 'v3.1', day: 79, title: 'v3.1 release', detail: 'Mobile offline mode', lift: 1.05 },
  ]
  const incidentStart = Math.floor(randomBetween(random, 40, 53))
  const incidentLength = random() < 0.5 ? 2 : 3

  let level = randomBetween(random, 27, 31)
  const days = Array.from({ length: 92 }, (_, day) => {
    const date = new Date(2025, 2, 1 + day)
    level *= 1 + randomBetween(random, -0.004, 0.006)
    const release = releases.find(r => r.day === day)
    if (release) level *= release.lift

    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const isIncident = day >= incidentStart && day < incidentStart + incidentLength
    const users = level * (isWeekend ? 0.84 : 1) * (isIncident ? randomBetween(random, 0.45, 0.6) : 1) * randomBetween(random, 0.97, 1.03)
    return { date, users: round(users) }
  })

  const incidentDays = days.slice(incidentStart, incidentStart + incidentLength)
  const lowest = incidentDays.reduce((min, d) => d.users < min.users ? d : min)
  const events: ChartEvent[] = [
    ...releases.map(r => ({ id: r.id, date: days[r.day].date, users: days[r.day].users, title: r.title, detail: r.detail })),
    { id: 'outage', date: lowest.date, users: lowest.users, title: 'Login outage', detail: `SSO down for ${incidentLength} days` },
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  return { days, events, incident: { start: incidentDays[0].date, end: incidentDays[incidentDays.length - 1].date } }
}
