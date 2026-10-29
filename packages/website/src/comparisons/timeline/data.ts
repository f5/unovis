import { randomGenerator, randomBetween } from '../utils/random'
import { HOUR, WEEK_START } from './constants'

export type EventKind = 'deployment' | 'incident' | 'maintenance'

export type TimelineEvent = {
  id: string;
  service: string;
  kind: EventKind;
  title: string;
  /** Timestamps in milliseconds */
  start: number;
  end: number;
  /** The deployment that caused an incident */
  causeId?: string;
}

export const services = ['API Gateway', 'Auth', 'Billing', 'Search', 'Notifications', 'Database', 'CDN']

export const kinds: { key: EventKind; label: string }[] = [
  { key: 'deployment', label: 'Deployment' },
  { key: 'incident', label: 'Incident' },
  { key: 'maintenance', label: 'Maintenance' },
]

export const getKindLabel = (kind: EventKind): string => kinds.find(k => k.key === kind).label

export const formatDay = (time: number): string => `${new Date(time).toLocaleDateString('en-US', { weekday: 'short' })} ${new Date(time).getDate()}`
export const formatTime = (time: number): string => new Date(time).toLocaleString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
export const formatDuration = (duration: number): string => {
  const hours = Math.floor(duration / HOUR)
  const minutes = Math.round((duration % HOUR) / 60000)
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`
}
export const formatRange = (d: TimelineEvent): string => `${formatTime(d.start)} – ${formatTime(d.end)} (${formatDuration(d.end - d.start)})`

const maintenanceTitles = ['Certificate rotation', 'OS patching', 'Index rebuild', 'Failover drill', 'Capacity upgrade']
const incidentTitles = ['Elevated error rate', 'Latency spike', 'Failed health checks', 'Queue backlog']

// Deployments, incidents and maintenance windows across seven services in the first full week of October 2025.
// Every incident follows a deployment to another service, which caused it
export function getData (seed: number): TimelineEvent[] {
  const random = randomGenerator(seed)
  // Times are in hours from Monday 00:00, rounded to 30 minutes
  const hours = (min: number, max: number): number => Math.round(randomBetween(random, min, max) * 2) / 2
  const pick = <T>(items: T[]): T => items[Math.floor(random() * items.length)]
  const toEvent = (id: string, service: string, kind: EventKind, title: string, start: number, duration: number, causeId?: string): TimelineEvent => ({
    id, service, kind, title, start: WEEK_START + start * HOUR, end: WEEK_START + (start + duration) * HOUR, causeId,
  })

  const events: TimelineEvent[] = []
  services.forEach((service, s) => {
    let start = hours(2, 24)
    for (let i = 0; ; i++) {
      const isMaintenance = random() < 0.3
      const duration = isMaintenance ? hours(4, 10) : hours(3, 8)
      if (start + duration > 164) break
      events.push(isMaintenance
        ? toEvent(`${s}-${i}`, service, 'maintenance', pick(maintenanceTitles), start, duration)
        : toEvent(`${s}-${i}`, service, 'deployment', `Release v${Math.floor(randomBetween(random, 2, 6))}.${Math.floor(random() * 20)}`, start, duration))
      start += duration + hours(18, 40)
    }
  })

  // Up to three incidents, each a few hours after a deployment, in a service that's free at the time
  const deployments = events.filter(d => d.kind === 'deployment')
  for (let attempt = 0, n = 0; attempt < 12 && n < 3; attempt++) {
    const cause = pick(deployments)
    const service = pick(services.filter(s => s !== cause.service))
    const start = (cause.end - WEEK_START) / HOUR + hours(2, 6)
    const incident = toEvent(`incident-${n}`, service, 'incident', pick(incidentTitles), start, hours(2, 6), cause.id)
    const isFree = events.every(d => d.service !== service || d.end + HOUR < incident.start || d.start > incident.end + HOUR)
    if (isFree && !events.some(d => d.causeId === cause.id) && incident.end < WEEK_START + 166 * HOUR) {
      events.push(incident)
      n++
    }
  }

  return events.sort((a, b) => services.indexOf(a.service) - services.indexOf(b.service) || a.start - b.start)
}
