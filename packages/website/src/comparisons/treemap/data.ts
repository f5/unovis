import { randomGenerator, randomBetween, round } from '../utils/random'

export type DataRecord = {
  team: string;
  service: string;
  /** Monthly cost in thousands of dollars */
  cost: number;
}

// Every service with the range of its monthly cost, in thousands of dollars
const services: { team: string; service: string; min: number; max: number }[] = [
  { team: 'Platform', service: 'Kubernetes', min: 40, max: 70 },
  { team: 'Platform', service: 'Load balancers', min: 8, max: 16 },
  { team: 'Platform', service: 'NAT gateways', min: 5, max: 12 },
  { team: 'Platform', service: 'Container registry', min: 2, max: 6 },
  { team: 'Data', service: 'Data warehouse', min: 30, max: 60 },
  { team: 'Data', service: 'Stream processing', min: 12, max: 24 },
  { team: 'Data', service: 'Object storage', min: 10, max: 20 },
  { team: 'Data', service: 'ETL jobs', min: 4, max: 10 },
  { team: 'Machine learning', service: 'GPU training', min: 35, max: 65 },
  { team: 'Machine learning', service: 'Model serving', min: 15, max: 30 },
  { team: 'Machine learning', service: 'Notebooks', min: 3, max: 8 },
  { team: 'Product', service: 'API servers', min: 18, max: 32 },
  { team: 'Product', service: 'Databases', min: 15, max: 28 },
  { team: 'Product', service: 'CDN', min: 5, max: 12 },
  { team: 'Product', service: 'Search', min: 4, max: 9 },
  { team: 'Security', service: 'Log archive', min: 6, max: 14 },
  { team: 'Security', service: 'Threat detection', min: 5, max: 11 },
  { team: 'Security', service: 'Key management', min: 1, max: 3 },
]

export const teams = [...new Set(services.map(s => s.team))]

export const formatCost = (value: number): string => `$${value.toFixed(1)}K`

// Monthly cloud spend by team and service, in thousands of dollars
export function getData (seed: number): DataRecord[] {
  const random = randomGenerator(seed)
  return services.map(({ team, service, min, max }) => ({ team, service, cost: round(randomBetween(random, min, max)) }))
}
