import { randomGenerator, randomBetween } from '../utils/random'

export type NodeGroup = 'client' | 'edge' | 'service' | 'data' | 'external'

export type NodeDatum = {
  id: string;
  label: string;
  group: NodeGroup;
  /** 95th percentile response time, in milliseconds */
  latency: number;
  /** Open alerts */
  alerts: number;
}

export type LinkDatum = {
  source: string;
  target: string;
  requests: number;
}

export type GraphData = {
  nodes: NodeDatum[];
  links: LinkDatum[];
}

export const groups: { key: NodeGroup; label: string }[] = [
  { key: 'client', label: 'Clients' },
  { key: 'edge', label: 'Edge' },
  { key: 'service', label: 'Services' },
  { key: 'data', label: 'Data stores' },
  { key: 'external', label: 'Third party' },
]

export const formatRequests = (requests: number): string => `${requests} req/s`
export const formatLatency = (latency: number): string => `p95 ${latency} ms`
export const formatAlerts = (alerts: number): string => alerts === 1 ? '1 alert' : `${alerts} alerts`

const allNodes: Pick<NodeDatum, 'id' | 'label' | 'group'>[] = [
  { id: 'web', label: 'Web app', group: 'client' },
  { id: 'mobile', label: 'Mobile app', group: 'client' },
  { id: 'partners', label: 'Partner API', group: 'client' },
  { id: 'cdn', label: 'CDN', group: 'edge' },
  { id: 'gateway', label: 'API gateway', group: 'edge' },
  { id: 'auth', label: 'Auth', group: 'service' },
  { id: 'users', label: 'Users', group: 'service' },
  { id: 'catalog', label: 'Catalog', group: 'service' },
  { id: 'search', label: 'Search', group: 'service' },
  { id: 'cart', label: 'Cart', group: 'service' },
  { id: 'orders', label: 'Orders', group: 'service' },
  { id: 'payments', label: 'Payments', group: 'service' },
  { id: 'shipping', label: 'Shipping', group: 'service' },
  { id: 'notifications', label: 'Notifications', group: 'service' },
  { id: 'recommendations', label: 'Recommendations', group: 'service' },
  { id: 'database', label: 'Database', group: 'data' },
  { id: 'cache', label: 'Cache', group: 'data' },
  { id: 'index', label: 'Search index', group: 'data' },
  { id: 'events', label: 'Event stream', group: 'data' },
  { id: 'storage', label: 'Object storage', group: 'data' },
  { id: 'payment-provider', label: 'Card processor', group: 'external' },
  { id: 'email-provider', label: 'Email provider', group: 'external' },
  { id: 'sms-provider', label: 'SMS provider', group: 'external' },
]

const allLinks: [string, string][] = [
  ['web', 'cdn'], ['web', 'gateway'], ['mobile', 'gateway'], ['partners', 'gateway'], ['cdn', 'storage'],
  ['gateway', 'auth'], ['gateway', 'users'], ['gateway', 'catalog'], ['gateway', 'search'], ['gateway', 'cart'],
  ['gateway', 'orders'], ['gateway', 'recommendations'], ['auth', 'users'], ['auth', 'cache'], ['users', 'database'],
  ['users', 'cache'], ['catalog', 'database'], ['catalog', 'cache'], ['catalog', 'storage'], ['search', 'index'],
  ['cart', 'cache'], ['cart', 'catalog'], ['orders', 'database'], ['orders', 'payments'], ['orders', 'shipping'],
  ['orders', 'events'], ['payments', 'payment-provider'], ['payments', 'database'], ['shipping', 'events'],
  ['events', 'notifications'], ['notifications', 'email-provider'], ['notifications', 'sms-provider'],
  ['recommendations', 'index'], ['recommendations', 'events'],
]

// Services that come and go between data updates
const optionalNodes = ['partners', 'search', 'shipping', 'notifications', 'recommendations', 'sms-provider']

// A service dependency graph with response times and open alerts on every service and requests per second on every connection
export function getData (seed: number): GraphData {
  const random = randomGenerator(seed)
  const candidates = allNodes
    .filter(n => !optionalNodes.includes(n.id) || random() < 0.7)
    .map(n => ({ ...n, latency: Math.round(randomBetween(random, 5, 400)), alerts: random() < 0.2 ? Math.ceil(random() * 3) : 0 }))
  const links = allLinks
    .filter(([source, target]) => candidates.some(n => n.id === source) && candidates.some(n => n.id === target))
    .map(([source, target]) => ({ source, target, requests: Math.round(randomBetween(random, 20, 1000)) }))
  const nodes = candidates.filter(n => links.some(l => l.source === n.id || l.target === n.id))

  return { nodes, links }
}
